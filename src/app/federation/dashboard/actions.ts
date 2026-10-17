"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, getScope } from "@/lib/scope";

export async function updateWorkerStatus(workerId: string, status: string) {
  const sessionUser = await requireRole('FEDERATION_ADMIN');
  const scope = await getScope(sessionUser);

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker || !worker.cooperativeId || !scope.cooperativeIds?.includes(worker.cooperativeId)) {
    throw new Error("Worker not found or not in your federation");
  }

  await prisma.worker.update({
    where: { id: workerId },
    data: { verificationStatus: status }
  });

  revalidatePath("/federation/dashboard");
}

export async function submitProposal(formData: FormData) {
  const sessionUser = await requireRole('FEDERATION_ADMIN');
  const scope = await getScope(sessionUser);

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const cooperativeId = formData.get("cooperativeId") as string;

  if (!title || !description || !cooperativeId) {
    throw new Error("Missing fields");
  }

  if (!scope.cooperativeIds?.includes(cooperativeId)) {
    throw new Error("Cooperative not found or not in your federation");
  }

  await prisma.cooperativeProposal.create({
    data: {
      title,
      description,
      cooperativeId,
      createdById: sessionUser.id,
      status: 'OPEN'
    }
  });

  revalidatePath("/federation/dashboard");
}

export async function updateComplaintStatus(complaintId: string, status: string, resolution?: string) {
  const sessionUser = await requireRole('FEDERATION_ADMIN');
  const scope = await getScope(sessionUser);

  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: { worker: true }
  });
  if (!complaint || !complaint.worker?.cooperativeId || !scope.cooperativeIds?.includes(complaint.worker.cooperativeId)) {
    throw new Error("Complaint not found or worker not in your federation");
  }

  await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status,
      resolution: resolution || undefined,
      resolvedAt: status === 'RESOLVED' ? new Date() : undefined,
    }
  });

  revalidatePath("/federation/dashboard");
}
