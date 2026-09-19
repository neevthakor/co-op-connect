import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

import { getWorkerProfile } from '@/services/worker-profile';
import { isValidState, isValidCity, ALL_INDIA_STATES_AND_UTS, INDIA_CITIES } from '@/lib/locations/india';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params;
    const workerId = resolvedParams.id;

    const profileData = await getWorkerProfile(workerId);

    if (!profileData) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    return NextResponse.json(profileData);
  } catch (error) {
    console.error('Worker Detail GET Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
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

    const resolvedParams = await params;
    const workerId = resolvedParams.id;

    const u = session.user;
    const isOwner = u.workerId === workerId;
    const isAdmin = u.role === 'ADMIN' || u.role === 'COOPERATIVE_ADMIN';
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (u.role === 'COOPERATIVE_ADMIN') {
      const worker = await prisma.worker.findUnique({ where: { id: workerId } });
      if (!worker) return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
      if (worker.cooperativeId !== u.cooperativeId) {
        return NextResponse.json({ error: 'Forbidden: Worker belongs to a different cooperative' }, { status: 403 });
      }
    }

    const body = await req.json();
    const {
      availabilityStatus,
      serviceRadius,
      bio,
      isEmergencyAvailable,
      workingHoursStart,
      workingHoursEnd,
      // BUG FIX: latitude/longitude were never accepted here, so a worker had no
      // way to set or correct their base location from their profile. That left
      // matchWorkers()/findNearbyWorkers() with no coordinates to compare against,
      // so the worker could never appear in "nearby" results.
      latitude,
      longitude,
      address,
      city,
      state,
    } = body;

    let normalizedState = state;
    if (state && typeof state === 'string' && state !== 'Unspecified') {
      const match = ALL_INDIA_STATES_AND_UTS.find(s => s.toLowerCase() === state.toLowerCase());
      if (!match) {
        return NextResponse.json({ error: 'Invalid state or union territory selected' }, { status: 400 });
      }
      normalizedState = match;
    }

    let normalizedCity = city;
    if (city && typeof city === 'string' && city !== 'Unspecified' && normalizedState) {
      const match = INDIA_CITIES[normalizedState]?.find(c => c.toLowerCase() === city.toLowerCase());
      if (!match) {
        return NextResponse.json({ error: 'Invalid city selected for the given state' }, { status: 400 });
      }
      normalizedCity = match;
    }

    const updated = await prisma.worker.update({
      where: { id: workerId },
      data: {
        ...(availabilityStatus ? { availabilityStatus } : {}),
        ...(serviceRadius !== undefined ? { serviceRadius: parseFloat(serviceRadius.toString()) } : {}),
        ...(bio !== undefined ? { bio } : {}),
        ...(isEmergencyAvailable !== undefined ? { isEmergencyAvailable: !!isEmergencyAvailable } : {}),
        ...(workingHoursStart ? { workingHoursStart } : {}),
        ...(workingHoursEnd ? { workingHoursEnd } : {}),
        ...(typeof latitude === 'number' && !isNaN(latitude) && latitude >= -90 && latitude <= 90 ? { latitude } : {}),
        ...(typeof longitude === 'number' && !isNaN(longitude) && longitude >= -180 && longitude <= 180 ? { longitude } : {}),
        ...(typeof address === 'string' ? { address: address.trim() } : {}),
        ...(typeof normalizedCity === 'string' ? { city: normalizedCity.trim() } : {}),
        ...(typeof normalizedState === 'string' ? { state: normalizedState.trim() } : {}),
        ...(body.avatar ? {
          user: {
            update: {
              avatar: body.avatar
            }
          }
        } : {})
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Worker Update Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}