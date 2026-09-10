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
    const status = searchParams.get('status');

    const workers = await prisma.worker.findMany({
      where: {
        ...(cooperativeId ? { cooperativeId } : {}),
        ...(status && status !== 'ALL' ? { verificationStatus: status } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        cooperative: true,
        skills: { include: { skill: true } },
        certifications: { include: { certification: true } },
      },
      orderBy: { averageRating: 'desc' },
    });

    return NextResponse.json(workers);
  } catch (error: any) {
    console.error('Admin Workers GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


