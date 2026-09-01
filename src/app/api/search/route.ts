import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    if (!q.trim()) {
      return NextResponse.json({ services: [], workers: [] });
    }

    const [services, workers] = await Promise.all([
      prisma.serviceCategory.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { skills: { some: { name: { contains: q } } } },
          ],
        },
        include: { skills: true },
        take: 10,
      }),
      prisma.worker.findMany({
        where: {
          verificationStatus: 'VERIFIED',
          OR: [
            { primaryTrade: { contains: q } },
            { user: { name: { contains: q } } },
            { skills: { some: { skill: { name: { contains: q } } } } },
          ],
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          cooperative: true,
        },
        take: 10,
      }),
    ]);

    return NextResponse.json({ services, workers });
  } catch (error: any) {
    console.error('Search API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

