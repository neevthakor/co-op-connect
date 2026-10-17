import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, handleApiError, getScope, cooperativeWhere, validateClientCooperativeId } from '@/lib/scope';

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

    const proposals = await prisma.cooperativeProposal.findMany({
      where: cooperativeId ? { cooperativeId } : cooperativeWhere(scope),
      include: {
        cooperative: true,
        createdBy: { select: { id: true, name: true } },
        votes: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = proposals.map((p) => {
      const yesVotes = p.votes.filter((v) => v.vote === 'YES').length;
      const noVotes = p.votes.filter((v) => v.vote === 'NO').length;
      const abstainVotes = p.votes.filter((v) => v.vote === 'ABSTAIN').length;
      const totalVotes = p.votes.length;
      const currentUserId = sessionUser.id;
      const userVote = currentUserId ? p.votes.find((v) => v.userId === currentUserId)?.vote || null : null;

      return {
        ...p,
        stats: {
          yesVotes,
          noVotes,
          abstainVotes,
          totalVotes,
          yesPercent: totalVotes > 0 ? Math.round((yesVotes / totalVotes) * 100) : 0,
          noPercent: totalVotes > 0 ? Math.round((noVotes / totalVotes) * 100) : 0,
        },
        userVote,
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await requireRole('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN', 'WORKER');
    const scope = await getScope(sessionUser);
    const userRole = scope.role;

    const body = await req.json();
    const { action = 'VOTE', proposalId, vote, title, description, cooperativeId } = body;

    if (action === 'CREATE_PROPOSAL') {
      if (!['ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN'].includes(userRole as string)) {
        return NextResponse.json({ error: 'Only admins can create proposals' }, { status: 403 });
      }

      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      let coopId = cooperativeId;
      if (!coopId && scope.role === 'COOPERATIVE_ADMIN') {
        coopId = scope.cooperativeId;
      }
      if (scope.role !== 'ADMIN' && scope.role !== 'COOPERATIVE_ADMIN' && scope.role !== 'FEDERATION_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      try {
        coopId = validateClientCooperativeId(scope, coopId) || coopId;
      } catch (error: any) {
    return handleApiError(error);
  }

      if (!coopId) {
        return NextResponse.json({ error: 'cooperativeId is required' }, { status: 400 });
      }

      const proposal = await prisma.cooperativeProposal.create({
        data: {
          cooperativeId: coopId as string,
          createdById: sessionUser.id,
          title,
          description,
          status: 'OPEN',
        },
      });

      return NextResponse.json(proposal, { status: 201 });
    }

    if (action === 'VOTE') {
      if (!proposalId || !vote) {
        return NextResponse.json({ error: 'proposalId and vote (YES/NO/ABSTAIN) are required' }, { status: 400 });
      }

      const voteRecord = await prisma.vote.upsert({
        where: {
          proposalId_userId: {
            proposalId,
            userId: sessionUser.id,
          },
        },
        create: {
          proposalId,
          userId: sessionUser.id,
          vote: vote.toUpperCase(),
        },
        update: {
          vote: vote.toUpperCase(),
        },
      });

      return NextResponse.json({ success: true, vote: voteRecord });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return handleApiError(error);
  }
}


