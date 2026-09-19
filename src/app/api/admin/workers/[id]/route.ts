import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendNotification } from '@/services/notification';
import { approveWorker, rejectWorker, suspendWorker, requestMoreInfo } from '@/services/verification';
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;
    console.log(`[AUTH DEBUG] PATCH /api/admin/workers/[id] - UserID: ${session?.user?.id}, Role: ${userRole}, CoopID: ${session?.user?.cooperativeId}`);
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const workerId = resolvedParams.id;
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

    const { status, reason } = body;
    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'MORE_INFO_REQUIRED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    if ((status === 'REJECTED' || status === 'SUSPENDED' || status === 'MORE_INFO_REQUIRED') && !reason?.trim()) {
      return NextResponse.json({ error: `A reason is required when status is ${status}` }, { status: 400 });
    }

    const expectedCoopId = userRole === 'COOPERATIVE_ADMIN' ? session.user.cooperativeId as string : undefined;

    let updatedWorker;
    
    if (status === 'VERIFIED') {
      updatedWorker = await approveWorker(workerId, session.user.id as string, reason, expectedCoopId);
    } else if (status === 'REJECTED') {
      updatedWorker = await rejectWorker(workerId, session.user.id as string, reason || 'Rejected by Admin', expectedCoopId);
    } else if (status === 'SUSPENDED') {
      updatedWorker = await suspendWorker(workerId, session.user.id as string, reason || 'Suspended by Admin', expectedCoopId);
    } else if (status === 'MORE_INFO_REQUIRED') {
      updatedWorker = await requestMoreInfo(workerId, session.user.id as string, reason || 'More info required', expectedCoopId);
    } else {
      const whereClause: { id: string, cooperativeId?: string } = { id: workerId };
      if (expectedCoopId) whereClause.cooperativeId = expectedCoopId;
      updatedWorker = await prisma.worker.update({
        where: whereClause,
        data: { verificationStatus: status },
        include: { user: true }
      });
    }

    let title = 'Verification Update';
    let msg = `Your profile verification status has been updated to ${status}.`;
    if (status === 'VERIFIED') {
      title = 'Profile Verified!';
      msg = 'Congratulations! Your profile has been verified and you can now receive jobs.';
    } else if (status === 'REJECTED') {
      title = 'Profile Rejected';
      msg = `Your profile application was rejected. Reason: ${reason || 'Not specified'}`;
    }

    await sendNotification(updatedWorker.user.id, 'WORKER', title, msg, { workerId, status });

    return NextResponse.json({ success: true, worker: updatedWorker });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error('Admin Worker Update Error:', error);
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Worker not found or forbidden' }, { status: 404 });
    }
    return NextResponse.json({ error: (error instanceof Error ? error.message : "Unknown error") }, { status: 500 });
  }
}
