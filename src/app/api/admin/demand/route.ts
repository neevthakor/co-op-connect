import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, handleApiError, getScope, cooperativeWhere } from '@/lib/scope';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await requireRole('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN');
    const scope = await getScope(sessionUser);

    const { searchParams } = new URL(req.url);
    const area = searchParams.get('area') || 'Ahmedabad';
    const categoryId = searchParams.get('categoryId');

    let allowedAreas: string[] | undefined;
    if (scope.role !== 'ADMIN') {
      const coops = await prisma.cooperative.findMany({
        where: cooperativeWhere(scope),
        select: { city: true }
      });
      allowedAreas = Array.from(new Set(coops.map(c => c.city).filter(Boolean))) as string[];
      if (allowedAreas.length === 0) allowedAreas = ['NONE'];
      if (area !== 'ALL' && area !== 'Ahmedabad') {
         if (!allowedAreas.map(a => a.toLowerCase()).includes(area.toLowerCase())) {
           return NextResponse.json({ error: 'Forbidden area for your scope' }, { status: 403 });
         }
         allowedAreas = [area]; // restrict to their queried area if they have access
      }
    }

    const demandWhere = {
      ...(allowedAreas ? { area: { in: allowedAreas, mode: 'insensitive' as const } } : (area !== 'ALL' && area !== 'Ahmedabad' ? { area: { contains: area, mode: 'insensitive' as const } } : {})),
      ...(categoryId ? { categoryId } : {}),
    };

    const [demandHistory, forecasts, skillGaps, categories] = await Promise.all([
      prisma.demandHistory.findMany({
        where: demandWhere,
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 50,
      }),
      prisma.demandForecast.findMany({
        where: demandWhere,
        include: { category: true },
        orderBy: { date: 'asc' },
        take: 30,
      }),
      prisma.skillGapRecord.findMany({
        where: demandWhere,
        include: { category: true },
        orderBy: { gap: 'desc' },
      }),
      prisma.serviceCategory.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      }),
    ]);

    // Aggregate by day of week or category for charts
    const categoryDemand: Record<string, number> = {};
    for (const d of demandHistory) {
      const name = d.category.name;
      categoryDemand[name] = (categoryDemand[name] || 0) + d.count;
    }

    return NextResponse.json({
      area,
      demandHistory,
      forecasts,
      skillGaps,
      categories,
      categoryDemand,
    });
  } catch (error) {
    return handleApiError(error);
  }
}


