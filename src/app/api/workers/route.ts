import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const trade = searchParams.get('trade');
    const cooperativeId = searchParams.get('cooperativeId');
    const status = searchParams.get('status') || 'VERIFIED';
    const emergency = searchParams.get('emergency');

    const workers = await prisma.worker.findMany({
      where: {
        ...(status !== 'ALL' ? { verificationStatus: status } : {}),
        ...(cooperativeId ? { cooperativeId } : {}),
        ...(trade ? { primaryTrade: { contains: trade, mode: 'insensitive' } } : {}),
        ...(emergency === 'true' ? { isEmergencyAvailable: true } : {}),
        ...(categoryId
          ? {
              skills: {
                some: {
                  skill: { categoryId },
                },
              },
            }
          : {}),
      },
      include: {
        user: { select: { id: true, name: true, phone: true, avatar: true } },
        cooperative: true,
        skills: { include: { skill: true } },
        certifications: { include: { certification: true } },
      },
      orderBy: { averageRating: 'desc' },
      take: 50,
    });

    return NextResponse.json(workers);
  } catch (error: any) {
    console.error('Workers GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

