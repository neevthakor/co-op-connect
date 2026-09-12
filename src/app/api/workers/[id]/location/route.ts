import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const workerId = resolvedParams.id;
    const sessionWorkerId = session.user.workerId;

    // Strict Authorization: A worker can only update their own location
    if (sessionWorkerId !== workerId && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { latitude, longitude } = body;

    if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json({ error: 'Invalid location data' }, { status: 400 });
    }

    const updatedWorker = await prisma.worker.update({
      where: { id: workerId },
      data: {
        latitude,
        longitude
      }
    });

    return NextResponse.json({ success: true, location: { lat: updatedWorker.latitude, lng: updatedWorker.longitude } });
  } catch (error: any) {
    console.error('Update Location Error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}
