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

    // Find eligible emergency responders
    const eligibleWorkers = await prisma.worker.findMany({
      where: {
        isEmergencyAvailable: true,
        verificationStatus: 'VERIFIED',
      },
      select: { userId: true }
    });

    // Commit emergency request and notifications atomically
    const [serviceRequest] = await prisma.$transaction([
      prisma.serviceRequest.create({
        data: {
          customerId,
          categoryId,
          description: `Emergency ${category} request at ${address}`,
          urgency: 'EMERGENCY',
          address,
          status: 'PENDING',
        }
      }),
      // Notify the requesting user for tracking
      prisma.notification.create({
        data: {
          userId: session.user.id,
          type: 'EMERGENCY',
          title: 'Emergency Service Request',
          body: `New emergency request for ${category} at ${address}`
        }
      }),
      // Notify the responders
      ...eligibleWorkers.map(w => prisma.notification.create({
        data: {
          userId: w.userId,
          type: 'EMERGENCY_ALERT',
          title: 'Emergency Request Available',
          body: `Urgent: New ${category} request reported at ${address}.`
        }
      }))
    ]);

    return NextResponse.json({ success: true, id: serviceRequest.id }, { status: 201 });
  } catch (error) {
    console.error('Emergency Request Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create emergency request' }, { status: 500 });
  }
}
