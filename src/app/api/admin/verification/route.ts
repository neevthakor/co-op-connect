import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { approveWorker, rejectWorker, requestMoreInfo, suspendWorker } from '@/services/verification';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';
    const cooperativeId = (session.user as any).cooperativeId;

    const workers = await prisma.worker.findMany({
      where: {
        ...(status !== 'ALL' ? { verificationStatus: status } : {}),
        ...(cooperativeId ? { cooperativeId } : {}),
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
        cooperative: true,
        skills: { include: { skill: true } },
        certifications: { include: { certification: true } },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return NextResponse.json(workers);
  } catch (error: any) {
    console.error('Admin Verification GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { workerId, action, reason, note } = body;
    const adminId = session.user.id || 'admin';

    if (!workerId || !action) {
      return NextResponse.json({ error: 'workerId and action are required' }, { status: 400 });
    }

    let updatedWorker;
    if (action === 'APPROVE') {
      updatedWorker = await approveWorker(workerId, adminId);
    } else if (action === 'REJECT') {
      updatedWorker = await rejectWorker(workerId, adminId, reason || 'Application criteria not met');
    } else if (action === 'REQUEST_INFO') {
      updatedWorker = await requestMoreInfo(workerId, adminId, note || 'Additional KYC proof required');
    } else if (action === 'SUSPEND') {
      updatedWorker = await suspendWorker(workerId, adminId, reason || 'Suspended by admin');
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, worker: updatedWorker });
  } catch (error: any) {
    console.error('Admin Verification PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

