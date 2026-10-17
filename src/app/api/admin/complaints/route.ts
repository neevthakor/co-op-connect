import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, handleApiError, getScope, workerWhere } from '@/lib/scope';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await requireRole('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN');
    const scope = await getScope(sessionUser);

    const complaints = await prisma.complaint.findMany({
      where: {
        worker: workerWhere(scope),
      },
      include: {
        customer: { include: { user: true } },
        worker: { include: { user: true } },
        booking: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(complaints);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await requireRole('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN');
    const scope = await getScope(sessionUser);

    const { id, status, resolution } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { worker: true }
    });

    if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Validate scope
    if (scope.role === 'COOPERATIVE_ADMIN' && complaint.worker?.cooperativeId !== scope.cooperativeId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (scope.role === 'FEDERATION_ADMIN' && (!complaint.worker?.cooperativeId || !scope.cooperativeIds?.includes(complaint.worker.cooperativeId))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        status,
        resolution: resolution || complaint.resolution,
        resolvedAt: status === 'RESOLVED' ? new Date() : null
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}
