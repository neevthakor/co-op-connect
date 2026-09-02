import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const area = searchParams.get('area') || 'Ahmedabad';
    const categoryId = searchParams.get('categoryId');

    const [demandHistory, forecasts, skillGaps, categories] = await Promise.all([
      prisma.demandHistory.findMany({
        where: {
          ...(area !== 'ALL' && area !== 'Ahmedabad' ? { area: { contains: area, mode: 'insensitive' } } : {}),
          ...(categoryId ? { categoryId } : {}),
        },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: 50,
      }),
      prisma.demandForecast.findMany({
        where: {
          ...(area !== 'ALL' && area !== 'Ahmedabad' ? { area: { contains: area, mode: 'insensitive' } } : {}),
          ...(categoryId ? { categoryId } : {}),
        },
        include: { category: true },
        orderBy: { date: 'asc' },
        take: 30,
      }),
      prisma.skillGapRecord.findMany({
        where: {
          ...(area !== 'ALL' && area !== 'Ahmedabad' ? { area: { contains: area, mode: 'insensitive' } } : {}),
          ...(categoryId ? { categoryId } : {}),
        },
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
  } catch (error: any) {
    console.error('Demand API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

