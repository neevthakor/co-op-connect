"use server";

import { requireRole, getScope } from "@/lib/scope";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function processWelfareTransaction(formData: FormData) {
  try {
    const sessionUser = await requireRole("FEDERATION_ADMIN", "ADMIN");
    const scope = await getScope(sessionUser);

    if (scope.role === "FEDERATION_ADMIN" && !scope.federationId) {
      throw new Error("No federation associated with this admin account");
    }

    // Determine federationId for this operation
    // If ADMIN, they need to select federationId. Let's assume ADMIN selects it, or it's passed in form.
    const federationId = formData.get("federationId") as string || scope.federationId;
    if (!federationId) {
      throw new Error("Federation ID is required");
    }

    if (scope.role === "FEDERATION_ADMIN" && federationId !== scope.federationId) {
      throw new Error("Forbidden: Cannot process transactions for another federation");
    }

    const type = formData.get("type") as "CONTRIBUTION" | "INSURANCE_PREMIUM" | "EMERGENCY_ADVANCE" | "TRAINING_VOUCHER";
    const amountStr = formData.get("amount") as string;
    const description = formData.get("description") as string;
    
    if (!type || !amountStr) throw new Error("Missing required fields");
    
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Amount must be greater than zero");
    }

    const isPayout = type !== "CONTRIBUTION";

    // Use Prisma transaction to ensure atomicity and prevent race conditions
    await prisma.$transaction(async (tx) => {
      // First ensure fund exists
      let fund = await tx.welfareFund.findUnique({
        where: { federationId }
      });

      if (!fund) {
        fund = await tx.welfareFund.create({
          data: { federationId, balance: 0 }
        });
      }

      if (isPayout) {
        // Prevent negative balance race condition
        // Re-read with a raw update query to decrement atomically and return updated row, 
        // OR we can just use `update` with `{ decrement: amount }` but Prisma won't natively prevent it going negative 
        // without a CHECK constraint. So we first read it, check, and update.
        // Prisma transaction isolation level doesn't lock rows in all DBs natively by default in interactive tx,
        // but we can enforce it by checking the balance and relying on the sequential nature or raw SQL.
        
        // Let's use a raw update to enforce balance >= amount
        const updated = await tx.$executeRaw`
          UPDATE "WelfareFund"
          SET balance = balance - ${amount}, "updatedAt" = NOW()
          WHERE id = ${fund.id} AND balance >= ${amount}
        `;
        
        if (updated === 0) {
          throw new Error("Insufficient funds or concurrent update failed");
        }
      } else {
        // Contribution
        await tx.welfareFund.update({
          where: { id: fund.id },
          data: { balance: { increment: amount } }
        });
      }

      // Record the transaction
      await tx.welfareTransaction.create({
        data: {
          welfareFundId: fund.id,
          type,
          amount,
          description: description || null,
        }
      });
      
      // If it's a payout specifically for a worker, the UI should ideally pass workerId, but schema 
      // doesn't link WelfareTransaction directly to Worker. (There is WelfareDisbursement).
      // We will stick to WelfareTransaction as it affects the overall Fund balance.
    });

    revalidatePath("/federation/welfare");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
