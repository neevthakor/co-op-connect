import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

import { getWorkerProfile } from '@/services/worker-profile';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const workerId = resolvedParams.id;

    const profileData = await getWorkerProfile(workerId);

    if (!profileData) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    return NextResponse.json(profileData);
  } catch (error: any) {
    console.error('Worker Detail GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    const u = session.user as any;
    const isOwner = u.workerId === workerId;
    const isAdmin = u.role === 'ADMIN' || u.role === 'COOPERATIVE_ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { availabilityStatus, serviceRadius, bio, isEmergencyAvailable, workingHoursStart, workingHoursEnd } = body;

    const updated = await prisma.worker.update({
      where: { id: workerId },
      data: {
        ...(availabilityStatus ? { availabilityStatus } : {}),
        ...(serviceRadius !== undefined ? { serviceRadius: parseFloat(serviceRadius.toString()) } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(isEmergencyAvailable !== undefined ? { isEmergencyAvailable: !!isEmergencyAvailable } : {}),
        ...(workingHoursStart ? { workingHoursStart } : {}),
        ...(workingHoursEnd ? { workingHoursEnd } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Worker Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

