import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    
    const body = await req.json();
    const { bookingId, latitude, longitude, description = "Emergency SOS Triggered" } = body;

    let reportedWorkerId = null;
    let reportedCustomerId = null;

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      });
      if (booking) {
        if (userRole === 'CUSTOMER') {
          reportedWorkerId = booking.workerId;
        } else if (userRole === 'WORKER') {
          reportedCustomerId = booking.customerId;
        }
      }
    }

    const incident = await prisma.incident.create({
      data: {
        bookingId,
        reporterId: userId,
        reportedWorkerId,
        reportedCustomerId,
        type: 'SOS',
        description,
        severity: 'CRITICAL',
        status: 'OPEN',
        latitude,
        longitude
      }
    });

    if (bookingId) {
      await prisma.bookingStatusHistory.create({
        data: {
          bookingId,
          status: 'EMERGENCY',
          note: `SOS triggered by ${userRole} at location: ${latitude}, ${longitude}`
        }
      });
    }

    // A real implementation would also send an SMS/Email to trusted contacts here or Admin
    
    return NextResponse.json({ success: true, incidentId: incident.id });
  } catch (error) {
    console.error('SOS Trigger Error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to trigger SOS' }, { status: 500 });
  }
}
