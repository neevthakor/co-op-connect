import { prisma } from "@/lib/prisma";
import { createAuditLog } from "./audit";

export async function submitForVerification(workerId: string) {
  return prisma.worker.update({
    where: { id: workerId },
    data: {
      verificationStatus: "UNDER_REVIEW",
    },
  });
}

export async function approveWorker(workerId: string, adminId: string, note?: string) {
  const updated = await prisma.worker.update({
    where: { id: workerId },
    data: {
      verificationStatus: "VERIFIED",
      identityVerified: true,
      verificationMethod: "ADMIN",
      verifiedAt: new Date(),
      verifiedById: adminId,
      verificationNotes: note || "Manually approved by Admin",
      riskFlag: "LOW",
    },
  });

  await createAuditLog(adminId, "APPROVE_WORKER", "WORKER", workerId, {
    status: "VERIFIED",
    method: "ADMIN",
  });

  return updated;
}

export async function rejectWorker(workerId: string, adminId: string, reason: string) {
  const updated = await prisma.worker.update({
    where: { id: workerId },
    data: {
      verificationStatus: "REJECTED",
    },
  });

  await createAuditLog(adminId, "REJECT_WORKER", "WORKER", workerId, {
    reason,
    status: "REJECTED",
  });

  return updated;
}

export async function requestMoreInfo(workerId: string, adminId: string, note: string) {
  const updated = await prisma.worker.update({
    where: { id: workerId },
    data: {
      verificationStatus: "MORE_INFO_REQUIRED",
    },
  });

  await createAuditLog(adminId, "REQUEST_INFO_WORKER", "WORKER", workerId, {
    note,
    status: "MORE_INFO_REQUIRED",
  });

  return updated;
}

export async function suspendWorker(workerId: string, adminId: string, reason: string) {
  const updated = await prisma.worker.update({
    where: { id: workerId },
    data: {
      verificationStatus: "SUSPENDED",
      availabilityStatus: "OFFLINE",
    },
  });

  await createAuditLog(adminId, "SUSPEND_WORKER", "WORKER", workerId, {
    reason,
    status: "SUSPENDED",
  });

  return updated;
}

export async function assessWorkerSkill(workerSkillId: string, adminId: string, status: string, notes?: string) {
  const updatedSkill = await prisma.workerSkill.update({
    where: { id: workerSkillId },
    data: {
      skillVerificationStatus: status,
      assessedById: adminId,
      assessedAt: new Date(),
      assessmentNotes: notes,
    },
    include: {
      worker: true,
      skill: true,
    }
  });

  await createAuditLog(adminId, "ASSESS_SKILL", "WORKER_SKILL", workerSkillId, {
    status,
    notes,
  });

  return updatedSkill;
}
