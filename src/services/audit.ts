import prisma from '@/lib/prisma';

export async function createAuditLog(userId: string, action: string, entityType: string, entityId: string, details?: any) {
  return await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      details: details ? JSON.stringify(details) : null
    }
  });
}
