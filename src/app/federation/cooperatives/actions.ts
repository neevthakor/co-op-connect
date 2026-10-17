"use server";

import { requireRole, getScope } from "@/lib/scope";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCooperative(formData: FormData) {
  try {
    const sessionUser = await requireRole("FEDERATION_ADMIN", "ADMIN");
    const scope = await getScope(sessionUser);

    const cooperativeId = formData.get("cooperativeId") as string;
    const name = formData.get("name") as string;
    const city = formData.get("city") as string;
    const registrationNo = formData.get("registrationNo") as string;
    const emergencyPhone = formData.get("emergencyPhone") as string;
    const isActive = formData.get("isActive") === "true";

    if (!cooperativeId || !name) {
      throw new Error("Missing required fields");
    }

    if (scope.role === "FEDERATION_ADMIN" && !scope.cooperativeIds?.includes(cooperativeId)) {
      throw new Error("Forbidden: Cooperative does not belong to your federation");
    }

    await prisma.cooperative.update({
      where: { id: cooperativeId },
      data: {
        name,
        city,
        registrationNo,
        emergencyPhone,
        isActive,
      }
    });

    revalidatePath("/federation/cooperatives");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
