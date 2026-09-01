import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const bookingId = resolvedParams.id;

    const proofs = await prisma.jobProof.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(proofs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    const resolvedParams = await Promise.resolve(params);
    const bookingId = resolvedParams.id;
    const body = await req.json();
    const { type = 'BEFORE', imageUrl, caption, latitude, longitude } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const workerId = (session.user as any).workerId || booking.workerId;

    const proof = await prisma.jobProof.create({
      data: {
        bookingId,
        workerId,
        type: type.toUpperCase() === 'AFTER' ? 'AFTER' : 'BEFORE',
        imageUrl: imageUrl || (type === 'BEFORE' ? '/uploads/proof-before.jpg' : '/uploads/proof-after.jpg'),
        caption: caption || `${type} service verification photo`,
        latitude: latitude ? parseFloat(latitude) : booking.latitude,
        longitude: longitude ? parseFloat(longitude) : booking.longitude,
      },
    });

    return NextResponse.json(proof, { status: 201 });
  } catch (error: any) {
    console.error('Job Proof Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to save job proof' }, { status: 500 });
  }
}

