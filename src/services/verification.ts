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
  const results = await prisma.$transaction([
    prisma.workerSkill.update({
      where: { id: workerSkillId },
      data: {
        verified: status === "SKILL_ASSESSED",
      },
      include: {
        worker: true,
        skill: true,
      },
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
  ]);
  return results[0];
}
