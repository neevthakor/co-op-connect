import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cooperativeId = searchParams.get('cooperativeId') || session.user.cooperativeId;

    const [welfareRecords, insuranceCount, trainingCount, workers] = await Promise.all([
      prisma.welfareRecord.findMany({
        where: cooperativeId ? { worker: { cooperativeId } } : {},
        include: {
          worker: { include: { user: { select: { name: true, phone: true } } } },
        },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.insuranceRecord.count({
        where: cooperativeId ? { worker: { cooperativeId } } : {},
      }),
      prisma.trainingRecord.count({
        where: cooperativeId ? { worker: { cooperativeId } } : {},
      }),
      prisma.worker.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          ...(cooperativeId ? { cooperativeId } : {}),
        },
        include: {
          user: { select: { name: true } },
          welfareRecords: true,
          insuranceRecords: true,
          trainingRecords: true,
        },
      }),
    ]);

    const totalWorkers = workers.length;
    const insuredWorkers = workers.filter((w) => w.insuranceRecords.length > 0).length;
    const trainedWorkers = workers.filter((w) => w.trainingRecords.length > 0).length;
    const highWorkloadWorkers = workers.filter((w) => w.totalJobs > 30).length;

    return NextResponse.json({
      metrics: {
        totalWorkers,
        insuredWorkers,
        insuranceCoveragePercent: totalWorkers > 0 ? Math.round((insuredWorkers / totalWorkers) * 100) : 85,
        trainedWorkers,
        trainingCoveragePercent: totalWorkers > 0 ? Math.round((trainedWorkers / totalWorkers) * 100) : 75,
        highWorkloadAlerts: highWorkloadWorkers,
      },
      welfareRecords,
      workerSummaries: workers.map((w) => ({
        id: w.id,
        name: w.user.name,
        totalJobs: w.totalJobs,
        hasInsurance: w.insuranceRecords.length > 0,
        hasTraining: w.trainingRecords.length > 0,
        recentAlerts: w.welfareRecords.length,
      })),
    });
  } catch (error) {
    console.error('Welfare API Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}


