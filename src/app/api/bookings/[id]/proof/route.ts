import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
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

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const u = session.user;
    const isCustomer = u.customerId === booking.customerId;
    const isWorker = u.workerId === booking.workerId;
    const isAdmin = u.role === 'ADMIN' || u.role === 'COOPERATIVE_ADMIN';
    if (!isCustomer && !isWorker && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const proofs = await prisma.jobProof.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proofs);
  } catch (error) {
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}

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
    const { type = 'BEFORE', imageUrl, caption, latitude, longitude } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const u = session.user;
    const isCustomer = u.customerId === booking.customerId;
    const isWorker = u.workerId === booking.workerId;
    const isAdmin = ['ADMIN', 'COOPERATIVE_ADMIN'].includes(u.role);

    const isBefore = type.toUpperCase() === 'BEFORE';
    const isAfter = type.toUpperCase() === 'AFTER';

    if (isBefore && !isCustomer && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Only the customer can upload BEFORE photos' }, { status: 403 });
    }
    
    if (isAfter && !isWorker && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden: Only the worker can upload AFTER photos' }, { status: 403 });
    }

    if (!isBefore && !isAfter) {
      return NextResponse.json({ error: 'Invalid photo type' }, { status: 400 });
    }

    const proof = await prisma.jobProof.create({
      data: {
        bookingId,
        workerId: booking.workerId, // Ensure it is linked to the booking's worker
        type: isAfter ? 'AFTER' : 'BEFORE',
        imageUrl: imageUrl,
        caption: caption || `${isAfter ? 'AFTER' : 'BEFORE'} service verification photo`,
        latitude: latitude ? parseFloat(latitude) : booking.latitude,
        longitude: longitude ? parseFloat(longitude) : booking.longitude,
      },
    });

    return NextResponse.json(proof, { status: 201 });
  } catch (error) {
    console.error('Job Proof Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Failed to save job proof' }, { status: 500 });
  }
}

