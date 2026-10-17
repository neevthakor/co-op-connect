
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, handleApiError, getScope, workerWhere, validateClientCooperativeId } from '@/lib/scope';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await requireRole('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN');
    const scope = await getScope(sessionUser);

    const { searchParams } = new URL(req.url);
    const clientCoopId = searchParams.get('cooperativeId');
    let cooperativeId: string | undefined;
    
    try {
      cooperativeId = validateClientCooperativeId(scope, clientCoopId);
    } catch (error) {
      return handleApiError(error);
    }

    const workerFilter = cooperativeId ? { cooperativeId } : workerWhere(scope);

    const [welfareRecords, , , workers, earningsSum, disbursementSum] = await Promise.all([
      prisma.welfareRecord.findMany({
        where: { worker: workerFilter },
        include: {
          worker: { include: { user: { select: { name: true, phone: true } } } },
        },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.insuranceRecord.count({
        where: { worker: workerFilter },
      }),
      prisma.trainingRecord.count({
        where: { worker: workerFilter },
      }),
      prisma.worker.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          ...workerFilter,
        },
        include: {
          user: { select: { name: true } },
          welfareRecords: true,
          insuranceRecords: true,
          trainingRecords: true,
          bookings: { where: { status: 'COMPLETED' }, select: { id: true } }
        },
      }),
      prisma.workerEarning.aggregate({
        where: { worker: workerFilter },
        _sum: { welfareDeduction: true }
      }),
      prisma.welfareDisbursement.aggregate({
        where: { worker: workerFilter },
        _sum: { amount: true }
      })
    ]);

    const totalWorkers = workers.length;
    const insuredWorkers = workers.filter((w) => w.insuranceRecords.length > 0).length;
    const trainedWorkers = workers.filter((w) => w.trainingRecords.length > 0).length;
    const highWorkloadWorkers = workers.filter((w) => w.bookings.length > 30).length;

    const totalCollected = earningsSum._sum.welfareDeduction || 0;
    const totalDisbursed = disbursementSum._sum.amount || 0;
    const currentBalance = totalCollected - totalDisbursed;

    return NextResponse.json({
      metrics: {
        totalWorkers,
        insuredWorkers,
        insuranceCoveragePercent: totalWorkers > 0 ? Math.round((insuredWorkers / totalWorkers) * 100) : 0,
        trainedWorkers,
        trainingCoveragePercent: totalWorkers > 0 ? Math.round((trainedWorkers / totalWorkers) * 100) : 0,
        highWorkloadAlerts: highWorkloadWorkers,
      },
      fund: {
        totalCollected,
        totalDisbursed,
        currentBalance
      },
      welfareRecords,
      workerSummaries: workers.map((w) => ({
        id: w.id,
        name: w.user.name,
        totalJobs: w.bookings.length || w.totalJobs,
        hasInsurance: w.insuranceRecords.length > 0,
        hasTraining: w.trainingRecords.length > 0,
        recentAlerts: w.welfareRecords.length,
        isEligibleForDisbursement: (w.bookings.length || w.totalJobs) >= 5
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}


