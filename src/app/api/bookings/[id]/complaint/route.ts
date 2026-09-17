import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const bookingId = resolvedParams.id;
    const body = await req.json();
    const { category = 'POOR_QUALITY', description } = body;

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const sessionUser = session.user;
    const isCustomer = sessionUser.customerId && sessionUser.customerId === booking.customerId;
    const isAdmin = sessionUser.role === 'ADMIN' || sessionUser.role === 'COOPERATIVE_ADMIN';

    if (!isCustomer && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customerId = booking.customerId;

    const complaint = await prisma.complaint.create({
      data: {
        bookingId,
        customerId,
        workerId: booking.workerId,
        category,
        description,
        status: 'OPEN',
      },
    });

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error: any) {
    console.error('Complaint Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to file complaint' }, { status: 500 });
  }
}

