import { NextRequest, NextResponse } from 'next/server';
import { processPayment, getPaymentStatus } from '@/services/payment';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { bookingId, amount, method = 'UPI', provider = 'SANDBOX' } = body;

    if (!bookingId || !amount) {
      return NextResponse.json({ error: 'bookingId and amount are required' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isCustomer = session.user.customerId === booking.customerId;
    const isAdmin = ['ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN'].includes(session.user.role);

    if (!isCustomer && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await processPayment({
      bookingId,
      amount: parseFloat(amount.toString()),
      method,
      provider,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Payment Error:', error);
    return NextResponse.json({ error: error.message || 'Payment processing failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const { prisma } = await import('@/lib/prisma');
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isCustomer = session.user.customerId === booking.customerId;
    const isWorker = session.user.workerId === booking.workerId;
    const isAdmin = ['ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN'].includes(session.user.role);

    if (!isCustomer && !isWorker && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payment = await getPaymentStatus(bookingId);
    return NextResponse.json(payment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

