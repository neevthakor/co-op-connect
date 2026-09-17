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

    const location = { latitude, longitude };
    const incident = await prisma.notification.create({ 
      data: { 
        userId, 
        type: 'EMERGENCY', 
        title: 'SOS Alert', 
        body: 'SOS Button Activated ' + JSON.stringify(location) 
      } 
    });
    
    await prisma.complaint.create({ 
      data: { 
        customerId: userId, 
        bookingId: bookingId || null, 
        category: 'SAFETY', 
        description: 'SOS Button Activated ' + JSON.stringify(location), 
        status: 'OPEN' 
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
    return NextResponse.json({ error: error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : 'Failed to trigger SOS' }, { status: 500 });
  }
}
