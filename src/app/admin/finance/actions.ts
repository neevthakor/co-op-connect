'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function releasePayout(payoutId: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  // Simulated transfer for hackathon demo
  // In a real application, this would integrate with a bank/UPI API
  // to initiate a direct transfer to the worker's account.

  await prisma.payout.update({
    where: { id: payoutId },
    data: { 
      status: 'RELEASED',
      releasedAt: new Date()
    }
  });

  revalidatePath('/admin/finance');
  return { success: true };
}
