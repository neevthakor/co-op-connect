import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, handleApiError, getScope, workerWhere } from '@/lib/scope';
import { approveWorker, rejectWorker, requestMoreInfo, suspendWorker } from '@/services/verification';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await requireRole('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN');
    const scope = await getScope(sessionUser);

    const { searchParams } = new URL(req.url);
    const rawStatus = searchParams.get('status');
    // If status is empty, null, or 'ALL', we do not filter by status.
    const status = rawStatus === 'ALL' || !rawStatus ? null : rawStatus;

    const whereClause: any = workerWhere(scope);
    if (status) {
      whereClause.verificationStatus = status;
    }

    const workers = await prisma.worker.findMany({
      where: whereClause,
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
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const sessionUser = await requireRole('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN');
    const scope = await getScope(sessionUser);
    const userRole = scope.role;

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    let body;
    try {
      body = await req.json();
    } catch (error: any) {
    return handleApiError(error);
  }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'JSON body must be an object' }, { status: 400 });
    }

    const { workerId, action, reason, note } = body;
    const adminId = sessionUser.id as string;

    if (!workerId || !action) {
      return NextResponse.json({ error: 'workerId and action are required' }, { status: 400 });
    }

    if (userRole === 'COOPERATIVE_ADMIN' || userRole === 'FEDERATION_ADMIN') {
      const worker = await prisma.worker.findUnique({ 
        where: { id: workerId },
        include: { cooperative: true }
      });
      
      if (!worker) {
        return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
      }

      if (userRole === 'COOPERATIVE_ADMIN' && worker.cooperativeId !== scope.cooperativeId) {
        return NextResponse.json({ error: 'Forbidden: Worker outside your cooperative' }, { status: 403 });
      }

      if (userRole === 'FEDERATION_ADMIN' && (!worker.cooperativeId || !scope.cooperativeIds?.includes(worker.cooperativeId))) {
        return NextResponse.json({ error: 'Forbidden: Worker outside your federation' }, { status: 403 });
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
      
      // Prevent cross-worker skill assessments bypassing the ownership check
      const workerSkill = await prisma.workerSkill.findUnique({ where: { id: skillId } });
      if (!workerSkill || workerSkill.workerId !== workerId) {
        return NextResponse.json({ error: 'Forbidden: Skill does not belong to this worker' }, { status: 403 });
      }

      const { assessWorkerSkill } = await import('@/services/verification');
      const updatedSkill = await assessWorkerSkill(skillId, adminId, status, notes);
      return NextResponse.json({ success: true, workerSkill: updatedSkill });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, worker: updatedWorker });
  } catch (error: any) {
    return handleApiError(error);
  }
}


