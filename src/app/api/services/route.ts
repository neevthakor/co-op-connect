import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emergency = searchParams.get('emergency');

    const categories = await prisma.serviceCategory.findMany({
      where: {
        isActive: true,
        ...(emergency === 'true' ? { isEmergency: true } : emergency === 'false' ? { isEmergency: false } : {}),
      },
      include: {
        skills: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Services GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

