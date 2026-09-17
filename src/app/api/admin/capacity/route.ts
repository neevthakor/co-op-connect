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

    const [workers, categories, activeBookings] = await Promise.all([
      prisma.worker.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          ...(cooperativeId ? { cooperativeId } : {}),
        },
        include: {
          skills: { include: { skill: { include: { category: true } } } },
          cooperative: true,
        },
      }),
      prisma.serviceCategory.findMany({
        where: { isActive: true },
      }),
      prisma.booking.count({
        where: {
          status: { in: ['IN_PROGRESS', 'TRAVELLING', 'ARRIVED'] },
          ...(cooperativeId ? { worker: { cooperativeId } } : {}),
        },
      }),
    ]);

    const tradeCapacity: Record<string, { total: number; available: number; busy: number }> = {};
    for (const w of workers) {
      const trade = w.primaryTrade || 'General';
      if (!tradeCapacity[trade]) {
        tradeCapacity[trade] = { total: 0, available: 0, busy: 0 };
      }
      tradeCapacity[trade].total += 1;
      if (w.availabilityStatus === 'AVAILABLE') tradeCapacity[trade].available += 1;
      else tradeCapacity[trade].busy += 1;
    }

    const totalWorkers = workers.length;
    const availableWorkers = workers.filter((w) => w.availabilityStatus === 'AVAILABLE').length;
    const utilizationRate = totalWorkers > 0 ? Math.round(((totalWorkers - availableWorkers) / totalWorkers) * 100) : 0;

    return NextResponse.json({
      totalWorkers,
      availableWorkers,
      activeBookings,
      utilizationRate,
      tradeCapacity,
      recommendations: [
        'Onboard 3 more AC Repair technicians in Western Ahmedabad before peak summer demand.',
        'High plumbing availability in Satellite allows taking more emergency jobs.',
        'Consider apprentice helper training in carpentry to meet commercial demand.',
      ],
    });
  } catch (error) {
    console.error('Capacity API Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}


