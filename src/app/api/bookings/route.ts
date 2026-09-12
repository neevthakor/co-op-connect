import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { createBooking } from '@/services/booking';
import { ensureServiceCategories } from '@/lib/reference-data';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customerId = session.user.customerId;
    const workerId = session.user.workerId;
    const role = session.user.role;

    const whereClause: any = {};
    if (role === 'CUSTOMER' && customerId) {
      whereClause.customerId = customerId;
    } else if ((role === 'WORKER' || role === 'HELPER') && workerId) {
      whereClause.workerId = workerId;
    } else if (role === 'COOPERATIVE_ADMIN') {
      const cooperativeId = session.user.cooperativeId;
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
      return NextResponse.json({ success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    let customerId = session.user.customerId;
    if (!customerId) {
      // Find or create customer record for this user
      console.time('[booking] customer lookup');
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      console.timeEnd('[booking] customer lookup');
      if (customer) {
        customerId = customer.id;
      } else {
        const newCustomer = await prisma.customer.create({
          data: {
            userId: session.user.id || 'default-user',
            city: body.city || 'Unspecified',
            state: body.state || 'Unspecified',
          },
        });
        customerId = newCustomer.id;
      }
    }

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
      return NextResponse.json({ success: false, error: 'workerId and categoryId are required', code: 'MISSING_FIELDS' }, { status: 400 });
    }

    // Removed ensureServiceCategories() from the hot path to avoid 10 sequential upserts on every booking

    console.time('[booking] category check');
    const categoryExists = await prisma.serviceCategory.findUnique({
      where: { id: categoryId }
    });
    console.timeEnd('[booking] category check');
    
    if (!categoryExists) {
      return NextResponse.json({ success: false, error: 'Selected service category is no longer available. Please select another service.', code: 'INVALID_CATEGORY' }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({ success: false, error: 'Could not resolve customer ID', code: 'CUSTOMER_MISSING' }, { status: 400 });
    }

    console.time('[booking] createBooking function');
    const booking = await createBooking({
      customerId,
      workerId,
      categoryId,
      description: description || 'Service booking',
      scheduledDate: scheduledDate ? new Date(scheduledDate) : new Date(),
      scheduledTime: scheduledTime || '10:00 AM',
      estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : 350,
      address: address || 'Service Location Not Provided',
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      isEmergency: !!isEmergency,
    });
    console.timeEnd('[booking] createBooking function');

    if (address && customerId) {
      try {
        const normalizedAddress = address.toLowerCase().trim();
        const existingLocations = await prisma.customerLocation.findMany({ where: { customerId } });
        const duplicate = existingLocations.find(l => l.address.toLowerCase().trim() === normalizedAddress);
        if (!duplicate) {
          await prisma.customerLocation.create({
            data: {
              customerId,
              address: address,
              city: body.city || 'Ahmedabad',
              state: body.state || 'Gujarat',
              latitude: latitude ? parseFloat(latitude) : null,
              longitude: longitude ? parseFloat(longitude) : null,
              isDefault: existingLocations.length === 0
            }
          });
        }
      } catch (locErr) {
        console.error('Failed to save customer location history:', locErr);
      }
    }

    const imageUrls = body.imageUrls;
    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      await prisma.jobProof.createMany({
        data: imageUrls.map((url: string) => ({
          bookingId: booking.id,
          workerId: booking.workerId,
          type: 'BEFORE',
          imageUrl: url,
          caption: 'Customer uploaded BEFORE photo during booking',
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
        }))
      });
    }

    return NextResponse.json({ success: true, booking }, { status: 201 });
  } catch (error: any) {
    console.error('Booking Creation Error:', error);
    
    let errorCode = 'INTERNAL_ERROR';
    let status = 500;
    if (error.message === 'Worker not found') { errorCode = 'WORKER_NOT_FOUND'; status = 404; }
    if (error.message.includes('not currently eligible')) { errorCode = 'WORKER_UNAVAILABLE'; status = 403; }
    if (error.message.includes('no longer available for the selected time')) { errorCode = 'SCHEDULING_CONFLICT'; status = 409; }
    
    return NextResponse.json({ success: false, error: error.message || 'Failed to create booking', code: errorCode }, { status });
  }
}

