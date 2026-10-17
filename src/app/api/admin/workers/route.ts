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

    const workerFilter = cooperativeId ? { cooperativeId } : workerWhere(scope);
    const status = searchParams.get('status');

    const workers = await prisma.worker.findMany({
      where: {
        ...workerFilter,
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
    return handleApiError(error);
  }
}


