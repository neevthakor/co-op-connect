"use server";

import { requireRole, getScope } from "@/lib/scope";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignRequestToCooperative(formData: FormData) {
  try {
    const sessionUser = await requireRole("FEDERATION_ADMIN", "ADMIN");
    const scope = await getScope(sessionUser);

    const requestId = formData.get("requestId") as string;
    const type = formData.get("type") as "SOCIETY" | "INSTITUTION";
    const cooperativeId = formData.get("cooperativeId") as string;

    if (!requestId || !type || !cooperativeId) {
      throw new Error("Missing required fields");
    }

    if (scope.role === "FEDERATION_ADMIN" && !scope.cooperativeIds?.includes(cooperativeId)) {
      throw new Error("Forbidden: Cooperative does not belong to your federation");
    }

    // Verify cooperative is active
    const coop = await prisma.cooperative.findUnique({ where: { id: cooperativeId } });
    if (!coop || !coop.isActive) {
      throw new Error("Selected cooperative is inactive or not found");
    }

    if (type === "SOCIETY") {
      const req = await prisma.societyServiceRequest.findUnique({ where: { id: requestId } });
      if (!req || req.status !== "OPEN") throw new Error("Request is not OPEN");
      if (req.cooperativeId) {
        throw new Error("Request is already assigned to a cooperative");
      }
      await prisma.societyServiceRequest.update({
        where: { id: requestId },
        data: { cooperativeId }
      });
    } else {
      const req = await prisma.institutionServiceRequest.findUnique({ where: { id: requestId } });
      if (!req || req.status !== "OPEN") throw new Error("Request is not OPEN");
      if (req.cooperativeId) {
        throw new Error("Request is already assigned to a cooperative");
      }
      await prisma.institutionServiceRequest.update({
        where: { id: requestId },
        data: { cooperativeId }
      });
    }

    revalidatePath("/federation/org-requests");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
