import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    let customerId = session.user.customerId;
    
    // Fallback lookup if session doesn't have customerId
    if (!customerId) {
      const customer = await prisma.customer.findUnique({
        where: { userId: session.user.id },
      });
      if (customer) {
        customerId = customer.id;
      } else {
        return NextResponse.json({ success: false, error: 'Customer profile not found' }, { status: 400 });
      }
    }

    const { category, address } = body;

    if (!category || !address) {
      return NextResponse.json({ success: false, error: 'Category and address are required' }, { status: 400 });
    }

    // Map the UI category to the actual category ID
    let categoryId: string;
    if (category === 'electrical') {
      categoryId = 'cat-electrician';
    } else if (category === 'water' || category === 'plumbing') {
      categoryId = 'cat-plumber';
    } else {
      return NextResponse.json({ success: false, error: 'Unsupported emergency category' }, { status: 400 });
    }

    // Use the actual matching algorithm with EMERGENCY urgency
    const { matchWorkers } = await import('@/services/matching');
    const matches = await matchWorkers({
      categoryId,
      latitude: 0, // In a real app we'd pass lat/long from the client for better distance score
      longitude: 0,
      urgency: 'EMERGENCY',
      searchedAddress: address
    });

    if (matches.length === 0) {
      return NextResponse.json({ success: false, error: 'No emergency responders available for this category and area' }, { status: 404 });
    }

    const topWorker = matches[0].worker;

    // We have a matched worker. Let's create an actual booking instantly instead of just queuing it
    const { createBooking } = await import('@/services/booking');
    
    // Default estimated price if not available
    const cat = await prisma.serviceCategory.findUnique({ where: { id: categoryId } });
    const estimatedPrice = cat?.basePrice || 450;
    
    // We set the date to today and time to now
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeStr = `${hours}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`;

    const booking = await createBooking({
      customerId,
      workerId: topWorker.id as string,
      categoryId,
      description: `Emergency ${category} request at ${address}`,
      scheduledDate: now,
      scheduledTime: timeStr,
      estimatedPrice,
      address,
      isEmergency: true
    });

    // We can auto-update status to ACCEPTED or let the worker accept it via the notification that createBooking sends.
    // For now, we leave it as REQUESTED so the worker has to accept, but it is a direct match, not a broadcast.

    return NextResponse.json({ success: true, id: booking.id }, { status: 201 });
  } catch (error) {
    console.error('Emergency Request Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create emergency request' }, { status: 500 });
  }
}
