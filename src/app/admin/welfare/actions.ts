'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function disburseWelfare(workerId: string, type: string, amount: number, details?: string) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  // Find the worker to check eligibility and cooperative
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    include: { bookings: { where: { status: 'COMPLETED' }, select: { id: true } } }
  });

  if (!worker) throw new Error('Worker not found');
  const totalJobs = worker.bookings.length || worker.totalJobs;
  if (totalJobs < 5) {
    throw new Error('Worker is not eligible yet (minimum 5 completed jobs required)');
  }

  // Calculate available fund balance
  const cooperativeId = worker.cooperativeId;
  const [earningsSum, disbursementSum] = await Promise.all([
    prisma.workerEarning.aggregate({
      where: cooperativeId ? { worker: { cooperativeId } } : {},
      _sum: { welfareDeduction: true }
    }),
    prisma.welfareDisbursement.aggregate({
      where: cooperativeId ? { worker: { cooperativeId } } : {},
      _sum: { amount: true }
    })
  ]);

  const currentBalance = (earningsSum._sum.welfareDeduction || 0) - (disbursementSum._sum.amount || 0);

  if (amount > currentBalance) {
    throw new Error('Insufficient welfare fund balance');
  }

  // Create disbursement
  await prisma.$transaction(async (tx) => {
    await tx.welfareDisbursement.create({
      data: {
        workerId,
        type,
        amount,
        description: details
      }
    });

    if (type === 'INSURANCE_PREMIUM') {
      await tx.insuranceRecord.create({
        data: {
          workerId,
          type: 'HEALTH',
          provider: 'Co-op Connect Welfare',
          premium: amount,
          validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });
    } else if (type === 'TRAINING_SUBSIDY') {
      await tx.trainingRecord.create({
        data: {
          workerId,
          program: details || 'Subsidized Training',
          provider: 'Cooperative Academy',
          cost: amount,
          completedAt: new Date()
        }
      });
    } else {
      // Emergency advance or other
      await tx.welfareRecord.create({
        data: {
          workerId,
          type: 'EMERGENCY_ADVANCE',
          details: `Issued emergency advance of ${amount}`
        }
      });
    }
  });

  revalidatePath('/admin/welfare');
  return { success: true };
}
