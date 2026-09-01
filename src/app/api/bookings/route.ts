import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createBooking } from '@/services/booking';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = (session.user as any).customerId;
    const workerId = (session.user as any).workerId;
    const role = (session.user as any).role;

    let whereClause: any = {};
    if (role === 'CUSTOMER' && customerId) {
      whereClause.customerId = customerId;
    } else if ((role === 'WORKER' || role === 'HELPER') && workerId) {
      whereClause.workerId = workerId;
    } else if (role === 'COOPERATIVE_ADMIN') {
      const cooperativeId = (session.user as any).cooperativeId;
      if (cooperativeId) {
        whereClause.worker = { cooperativeId };
      }
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        category: true,
        worker: {
          include: {
            user: { select: { id: true, name: true, phone: true, avatar: true } },
            cooperative: true,
          },
        },
        customer: {
          include: {
            user: { select: { id: true, name: true, phone: true } },
          },
        },
        payment: true,
        invoice: true,
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Bookings GET Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let customerId = (session.user as any).customerId;
    if (!customerId) {
      // Find or create customer record for this user
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      if (customer) {
        customerId = customer.id;
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            userId: session.user.id || 'default-user',
            city: 'Ahmedabad',
            state: 'Gujarat',
          },
        });
        customerId = newCustomer.id;
      }
    }

    const body = await req.json();
    const {
      workerId,
      categoryId,
      description,
      scheduledDate,
      scheduledTime,
      estimatedPrice,
      address,
      latitude,
      longitude,
      isEmergency,
    } = body;

    if (!workerId || !categoryId) {
      return NextResponse.json({ error: 'workerId and categoryId are required' }, { status: 400 });
    }

    const booking = await createBooking({
      customerId,
      workerId,
      categoryId,
      description: description || 'Service booking',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      scheduledTime: scheduledTime || '10:00 AM',
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : 350,
      address: address || 'Ahmedabad, Gujarat',
      latitude: latitude ? parseFloat(latitude) : 23.0225,
      longitude: longitude ? parseFloat(longitude) : 72.5714,
      isEmergency: !!isEmergency,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    console.error('Booking Creation Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create booking' }, { status: 500 });
  }
}

