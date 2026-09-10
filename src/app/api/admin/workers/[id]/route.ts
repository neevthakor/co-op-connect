import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendNotification } from '@/services/notification';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const workerId = resolvedParams.id;
    const body = await req.json();
    const { status, reason } = body;

    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'SUSPENDED', 'MORE_INFO_REQUIRED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid verification status' }, { status: 400 });
    }

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: { user: true }
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: { verificationStatus: status }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'UPDATE_WORKER_VERIFICATION',
        entityType: 'WORKER',
        entityId: workerId,
        details: JSON.stringify({ oldStatus: worker.verificationStatus, newStatus: status, reason })
      }
    });

    let title = 'Verification Update';
    let msg = `Your profile verification status has been updated to ${status}.`;
    if (status === 'VERIFIED') {
      title = 'Profile Verified!';
      msg = 'Congratulations! Your profile has been verified and you can now receive jobs.';
    } else if (status === 'REJECTED') {
      title = 'Profile Rejected';
      msg = `Your profile application was rejected. Reason: ${reason || 'Not specified'}`;
    }

    await sendNotification(worker.user.id, 'WORKER', title, msg, { workerId, status });

    return NextResponse.json({ success: true, worker: updatedWorker });
  } catch (error: any) {
    console.error('Admin Worker Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
