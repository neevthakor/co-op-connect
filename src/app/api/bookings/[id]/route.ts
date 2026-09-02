import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { updateBookingStatus, verifyServicePin, cancelBooking } from '@/services/booking';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const bookingId = resolvedParams.id;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    const workerId = (session.user as any).workerId;
    const customerId = (session.user as any).customerId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        category: true,
        worker: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatar: true } },
            cooperative: true,
            skills: { include: { skill: true } },
          },
        },
        customer: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        materialRequests: true,
        invoice: {
          include: { items: true },
        },
        jobProofs: true,
        rating: true,
        payment: true,
        warranty: true,
        team: {
          include: {
            members: {
              include: {
                worker: {
                  include: {
                    user: { select: { id: true, name: true, phone: true, avatar: true } },
                  },
                },
              },
            },
          },
        },
        helperRequests: {
          include: {
            helper: {
              include: {
                user: { select: { id: true, name: true, phone: true, avatar: true } },
              },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (userRole === 'CUSTOMER' && booking.customerId !== customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (userRole === 'WORKER' && booking.workerId !== workerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (userRole === 'WORKER' && booking.workerId === workerId && booking.status === 'REQUESTED') {
      if (booking.customer && booking.customer.user) {
        booking.customer.user.phone = null;
      }
    }

    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Booking GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const bookingId = resolvedParams.id;
    const body = await req.json();
    const { status, pin, note, reason } = body;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const workerId = (session.user as any).workerId;
    const customerId = (session.user as any).customerId;

    if (userRole === 'CUSTOMER' && booking.customerId !== customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (userRole === 'WORKER' && booking.workerId !== workerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Handle PIN verification
    if (pin) {
      const pinResult = await verifyServicePin(bookingId, pin);
      if (!pinResult.success) {
        return NextResponse.json({ error: pinResult.message }, { status: 400 });
      }
      const updated = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          category: true,
          worker: { include: { user: true } },
          statusHistory: true,
        },
      });
      return NextResponse.json({ success: true, booking: updated });
    }

    // Handle cancellation
    if (status === 'CANCELLED') {
      const updated = await cancelBooking(bookingId, reason || note || 'User cancelled booking');
      return NextResponse.json({ success: true, booking: updated });
    }

    // Handle normal status transition
    if (status) {
      const updated = await updateBookingStatus(bookingId, status, note);
      return NextResponse.json({ success: true, booking: updated });
    }

    return NextResponse.json({ error: 'No valid action provided' }, { status: 400 });
  } catch (error: any) {
    console.error('Booking PATCH Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update booking' }, { status: 500 });
  }
}

