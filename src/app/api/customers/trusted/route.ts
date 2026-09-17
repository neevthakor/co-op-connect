import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = session.user.customerId;
    const trusted = await prisma.trustedWorker.findMany({
      where: customerId ? { customerId } : { customer: { userId: session.user.id } },
      include: {
        worker: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatar: true } },
            cooperative: true,
            skills: { include: { skill: true } },
          },
        },
      },
    });

    return NextResponse.json(trusted);
  } catch (error) {
    console.error('Trusted Workers GET Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let customerId = session.user.customerId;
    if (!customerId) {
      const cust = await prisma.customer.findUnique({ where: { userId: session.user.id } });
      customerId = cust?.id;
    }

    if (!customerId) {
      return NextResponse.json({ error: 'Customer account not found' }, { status: 404 });
    }

    const body = await req.json();
    const { workerId, notes } = body;

    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 });
    }

    const record = await prisma.trustedWorker.upsert({
      where: {
        customerId_workerId: { customerId, workerId },
      },
      create: { customerId, workerId },
      update: {},
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Trusted Workers POST Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let customerId = session.user.customerId;
    if (!customerId) {
      const cust = await prisma.customer.findUnique({ where: { userId: session.user.id } });
      customerId = cust?.id;
    }

    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get('workerId');

    if (!workerId || !customerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 });
    }

    await prisma.trustedWorker.deleteMany({
      where: { customerId, workerId },
    });

    return NextResponse.json({ success: true, message: 'Removed from trusted workers' });
  } catch (error) {
    console.error('Trusted Workers DELETE Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}

