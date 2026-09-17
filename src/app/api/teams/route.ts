import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendNotification } from '@/services/notification';
import { createTeam, addTeamMember } from '@/services/team';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');
    const workerId = session.user.workerId;
    const isAdmin = ['ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN'].includes(session.user.role);

    if (bookingId) {
      const team = await prisma.jobTeam.findUnique({
        where: { bookingId },
        include: {
          members: {
            include: {
              worker: { include: { user: true } },
            },
          },
        },
      });
      return NextResponse.json(team || null);
    }

    if (!workerId && !isAdmin) {
      return NextResponse.json({ helperRequests: [], teams: [] });
    }

    // Return helper requests where current worker is lead or helper
    const helperRequests = await prisma.helperRequest.findMany({
      where: workerId
        ? {
            OR: [{ leadWorkerId: workerId }, { helperId: workerId }],
          }
        : {},
      include: {
        leadWorker: { include: { user: true } },
        helper: { include: { user: true } },
        booking: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const teams = await prisma.jobTeam.findMany({
      where: workerId
        ? {
            OR: [
              { leadWorkerId: workerId },
              { members: { some: { workerId } } },
            ],
          }
        : {},
      include: {
        booking: { include: { category: true } },
        members: {
          include: {
            worker: { include: { user: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ helperRequests, teams });
  } catch (error) {
    console.error('Teams GET Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action = 'REQUEST_HELPER', bookingId, helperId, requiredSkillId } = body;

    const leadWorkerId = session.user.workerId;
    if (!leadWorkerId) {
      return NextResponse.json({ error: 'Only workers can request helpers or create teams' }, { status: 403 });
    }

    if (action === 'REQUEST_HELPER') {
      if (!bookingId || !helperId) {
        return NextResponse.json({ error: 'bookingId and helperId are required' }, { status: 400 });
      }

      const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.workerId !== leadWorkerId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const helperRequest = await prisma.helperRequest.create({
        data: {
          bookingId,
          leadWorkerId,
          helperId,
          requiredSkillId: requiredSkillId || null,
          status: 'PENDING',
        },
        include: {
          leadWorker: { include: { user: true } },
          helper: { include: { user: true } },
          booking: { include: { category: true } },
        },
      });

      // Send notification to helper
      if (helperRequest.helper?.user?.id) {
        await sendNotification(
          helperRequest.helper.user.id,
          'WORKER',
          'Helper Request Received',
          `${helperRequest.leadWorker.user.name} has requested you as a helper on a ${helperRequest.booking.category.name} job with a 30% revenue split!`,
          { bookingId, helperRequestId: helperRequest.id }
        );
      }

      return NextResponse.json(helperRequest, { status: 201 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Teams POST Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Team operation failed' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { requestId, action = 'ACCEPT' } = body; // 'ACCEPT' or 'REJECT'

    if (!requestId) {
      return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
    }

    const helperRequest = await prisma.helperRequest.findUnique({
      where: { id: requestId },
      include: {
        leadWorker: { include: { user: true } },
        helper: { include: { user: true } },
        booking: { include: { category: true } },
      },
    });

    if (!helperRequest) {
      return NextResponse.json({ error: 'Helper request not found' }, { status: 404 });
    }

    const workerId = session.user.workerId;
    const isAdmin = ['ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN'].includes(session.user.role);
    
    if (helperRequest.helperId !== workerId && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'ACCEPT') {
      // 1. Update HelperRequest
      await prisma.helperRequest.update({
        where: { id: requestId },
        data: { status: 'ACCEPTED' },
      });

      // 2. Create or find JobTeam
      let team = await prisma.jobTeam.findUnique({
        where: { bookingId: helperRequest.bookingId },
        include: { members: true },
      });

      if (!team) {
        team = await createTeam(helperRequest.bookingId, helperRequest.leadWorkerId);
      }

      // 3. Add Helper to team with 30% revenue share
      if (helperRequest.helperId) {
        await addTeamMember(team.id, helperRequest.helperId, 'HELPER', 30);
      }

      // 4. Notify lead worker
      if (helperRequest.leadWorker?.user?.id) {
        await sendNotification(
          helperRequest.leadWorker.user.id,
          'WORKER',
          'Helper Request Accepted!',
          `${helperRequest.helper?.user.name} accepted your helper request. Job team formed with 70% Lead / 30% Helper split.`,
          { bookingId: helperRequest.bookingId, teamId: team.id }
        );
      }

      const updatedTeam = await prisma.jobTeam.findUnique({
        where: { id: team.id },
        include: {
          members: {
            include: {
              worker: { include: { user: true } },
            },
          },
        },
      });

      return NextResponse.json({ success: true, team: updatedTeam });
    } else {
      await prisma.helperRequest.update({
        where: { id: requestId },
        data: { status: 'REJECTED' },
      });

      return NextResponse.json({ success: true, status: 'REJECTED' });
    }
  } catch (error) {
    console.error('Teams PATCH Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Failed to update helper request' }, { status: 500 });
  }
}

