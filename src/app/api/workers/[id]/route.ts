import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const workerId = resolvedParams.id;

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true, avatar: true } },
        cooperative: true,
        skills: { include: { skill: { include: { category: true } } } },
        certifications: { include: { certification: true } },
        portfolioItems: true,
        ratings: {
          include: { customer: { include: { user: { select: { name: true, avatar: true } } } } },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        availability: true,
      },
    });

    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    return NextResponse.json(worker);
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

