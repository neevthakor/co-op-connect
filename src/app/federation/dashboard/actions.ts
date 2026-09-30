"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";

export async function updateWorkerStatus(workerId: string, status: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'FEDERATION_ADMIN') {
    throw new Error("Unauthorized");
  }

  await prisma.worker.update({
    where: { id: workerId },
    data: { verificationStatus: status }
  });

  revalidatePath("/federation/dashboard");
}

export async function submitProposal(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'FEDERATION_ADMIN') {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const cooperativeId = formData.get("cooperativeId") as string;

  if (!title || !description || !cooperativeId) {
    throw new Error("Missing fields");
  }

  await prisma.cooperativeProposal.create({
    data: {
      title,
      description,
      cooperativeId,
      createdById: session.user.id,
      status: 'OPEN'
    }
  });

  revalidatePath("/federation/dashboard");
}

export async function updateComplaintStatus(complaintId: string, status: string, resolution?: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'FEDERATION_ADMIN') {
    throw new Error("Unauthorized");
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
