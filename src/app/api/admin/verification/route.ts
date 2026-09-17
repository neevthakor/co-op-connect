import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { approveWorker, rejectWorker, requestMoreInfo, suspendWorker } from '@/services/verification';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING';
    const cooperativeId = session.user.cooperativeId;

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
  } catch (error) {
    console.error('Admin Verification GET Error:', error);
    return NextResponse.json({ error: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Unknown error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or empty JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'JSON body must be an object' }, { status: 400 });
    }

    const { workerId, action, reason, note } = body;
    const adminId = session.user.id as string;

    if (!workerId || !action) {
      return NextResponse.json({ error: 'workerId and action are required' }, { status: 400 });
    }

    if (userRole === 'COOPERATIVE_ADMIN') {
      const worker = await prisma.worker.findUnique({ where: { id: workerId } });
      if (!worker || worker.cooperativeId !== session.user.cooperativeId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    let updatedWorker;
    if (action === 'APPROVE') {
      updatedWorker = await approveWorker(workerId, adminId, note);
    } else if (action === 'REJECT') {
      updatedWorker = await rejectWorker(workerId, adminId, reason || 'Application criteria not met');
    } else if (action === 'REQUEST_INFO') {
      updatedWorker = await requestMoreInfo(workerId, adminId, note || 'Additional KYC proof required');
    } else if (action === 'SUSPEND') {
      updatedWorker = await suspendWorker(workerId, adminId, reason || 'Suspended by admin');
    } else if (action === 'ASSESS_SKILL') {
      const { skillId, status, notes } = body;
      if (!skillId || !status) {
        return NextResponse.json({ error: 'skillId and status are required for ASSESS_SKILL' }, { status: 400 });
      }
      
      const { assessWorkerSkill } = await import('@/services/verification');
      const updatedSkill = await assessWorkerSkill(skillId, adminId, status, notes);
      return NextResponse.json({ success: true, workerSkill: updatedSkill });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, worker: updatedWorker });
  } catch (error) {
    console.error('Admin Verification PATCH Error:', error);
    return NextResponse.json({ error: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Unknown error' }, { status: 500 });
  }
}


