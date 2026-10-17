"use server";

import { requireRole, getScope } from "@/lib/scope";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createProposal(formData: FormData) {
  try {
    const sessionUser = await requireRole("FEDERATION_ADMIN", "ADMIN");
    const scope = await getScope(sessionUser);

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const cooperativeId = formData.get("cooperativeId") as string;

    if (!title || !description || !cooperativeId) {
      throw new Error("Missing required fields");
    }

    if (scope.role === "FEDERATION_ADMIN" && !scope.cooperativeIds?.includes(cooperativeId)) {
      throw new Error("Forbidden: Cooperative does not belong to your federation");
    }

    await prisma.cooperativeProposal.create({
      data: {
        title,
        description,
        cooperativeId,
        createdById: sessionUser.id,
      }
    });

    revalidatePath("/federation/governance");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function castVote(formData: FormData) {
  try {
    const sessionUser = await requireRole("FEDERATION_ADMIN", "ADMIN");
    const scope = await getScope(sessionUser);

    const proposalId = formData.get("proposalId") as string;
    const voteChoice = formData.get("vote") as string; // 'YES', 'NO', 'ABSTAIN'

    if (!proposalId || !voteChoice) throw new Error("Missing fields");

    const proposal = await prisma.cooperativeProposal.findUnique({
      where: { id: proposalId }
    });

    if (!proposal) throw new Error("Proposal not found");

    if (scope.role === "FEDERATION_ADMIN" && !scope.cooperativeIds?.includes(proposal.cooperativeId)) {
      throw new Error("Forbidden: Proposal belongs to another federation");
    }

    // Upsert vote
    const existingVote = await prisma.vote.findFirst({
      where: { proposalId, userId: sessionUser.id }
    });

    if (existingVote) {
      await prisma.vote.update({
        where: { id: existingVote.id },
        data: { vote: voteChoice }
      });
    } else {
      await prisma.vote.create({
        data: {
          proposalId,
          userId: sessionUser.id,
          vote: voteChoice
        }
      });
    }

    revalidatePath("/federation/governance");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
