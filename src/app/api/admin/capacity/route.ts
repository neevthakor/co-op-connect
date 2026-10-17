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
    } catch (error: any) {
    return handleApiError(error);
  }

    const wWhere = cooperativeId ? { cooperativeId } : workerWhere(scope);

    const [workers, categories, activeBookings] = await Promise.all([
      prisma.worker.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          ...wWhere,
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
          worker: wWhere,
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
  } catch (error: any) {
    return handleApiError(error);
  }
}


