import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cooperativeId = (session.user as any).cooperativeId;

    const complaints = await prisma.complaint.findMany({
      where: cooperativeId ? {
        worker: { cooperativeId }
      } : {},
      include: {
        customer: { include: { user: true } },
        worker: { include: { user: true } },
        booking: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(complaints);
  } catch (error: any) {
    console.error('Admin Complaints GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, resolution } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: { worker: true }
    });

    if (!complaint) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const cooperativeId = (session.user as any).cooperativeId;
    if (cooperativeId && complaint.worker && complaint.worker.cooperativeId !== cooperativeId) {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
