import { prisma } from "@/lib/prisma";

export async function submitForVerification(workerId: string) {
  return prisma.worker.update({
    where: { id: workerId },
    data: {
      verificationStatus: "UNDER_REVIEW",
    },
  });
}

export async function approveWorker(workerId: string, adminId: string, note?: string, expectedCoopId?: string) {
  const whereClause: { id: string, cooperativeId?: string } = { id: workerId };
  if (expectedCoopId) whereClause.cooperativeId = expectedCoopId;
  
  const results = await prisma.$transaction([
    prisma.worker.update({
      where: whereClause,
      data: {
        verificationStatus: "VERIFIED",
        identityVerified: true,
      },
      include: { user: true }
    }),
    prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "APPROVE_WORKER",
        entityType: "WORKER",
        entityId: workerId,
        details: JSON.stringify({ status: "VERIFIED", method: "ADMIN", note }),
      },
    }),
  ]);
  return results[0];
}

export async function rejectWorker(workerId: string, adminId: string, reason: string, expectedCoopId?: string) {
  const whereClause: { id: string, cooperativeId?: string } = { id: workerId };
  if (expectedCoopId) whereClause.cooperativeId = expectedCoopId;
  
  const results = await prisma.$transaction([
    prisma.worker.update({
      where: whereClause,
      data: {
        verificationStatus: "REJECTED",
      },
      include: { user: true }
    }),
    prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "REJECT_WORKER",
        entityType: "WORKER",
        entityId: workerId,
        details: JSON.stringify({ reason, status: "REJECTED" }),
      },
    }),
  ]);
  return results[0];
}

export async function requestMoreInfo(workerId: string, adminId: string, note: string, expectedCoopId?: string) {
  const whereClause: { id: string, cooperativeId?: string } = { id: workerId };
  if (expectedCoopId) whereClause.cooperativeId = expectedCoopId;
  
  const results = await prisma.$transaction([
    prisma.worker.update({
      where: whereClause,
      data: {
        verificationStatus: "MORE_INFO_REQUIRED",
      },
      include: { user: true }
    }),
    prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "REQUEST_INFO_WORKER",
        entityType: "WORKER",
        entityId: workerId,
        details: JSON.stringify({ note, status: "MORE_INFO_REQUIRED" }),
      },
    }),
  ]);
  return results[0];
}

export async function suspendWorker(workerId: string, adminId: string, reason: string, expectedCoopId?: string) {
  const whereClause: { id: string, cooperativeId?: string } = { id: workerId };
  if (expectedCoopId) whereClause.cooperativeId = expectedCoopId;
  
  const results = await prisma.$transaction([
    prisma.worker.update({
      where: whereClause,
      data: {
        verificationStatus: "SUSPENDED",
        availabilityStatus: "OFFLINE",
      },
      include: { user: true }
    }),
    prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "SUSPEND_WORKER",
        entityType: "WORKER",
        entityId: workerId,
        details: JSON.stringify({ reason, status: "SUSPENDED" }),
      },
    }),
  ]);
  return results[0];
}

export async function assessWorkerSkill(workerSkillId: string, adminId: string, status: string, notes?: string) {
  const isVerified = status === "SKILL_ASSESSED";

  const existingSkill = await prisma.workerSkill.findUnique({
    where: { id: workerSkillId },
    include: { worker: true, skill: true }
  });

  if (!existingSkill) throw new Error("Worker skill not found");

  const ops: any[] = [
    prisma.workerSkill.update({
      where: { id: workerSkillId },
      data: { verified: isVerified },
      include: { worker: true, skill: true },
    }),
    prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "ASSESS_SKILL",
        entityType: "WORKER_SKILL",
        entityId: workerSkillId,
        details: JSON.stringify({ status, notes }),
      },
    }),
  ];

  if (isVerified) {
    const certNo = `CERT-${existingSkill.workerId.slice(-6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    ops.push(
      prisma.platformCertificate.create({
        data: {
          certificateNo: certNo,
          workerId: existingSkill.workerId,
          trade: existingSkill.skill.name,
          cooperativeId: existingSkill.worker.cooperativeId,
        }
      })
    );
  }

  const results = await prisma.$transaction(ops);
  return results[0];
}
