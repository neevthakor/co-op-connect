import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendNotification } from '@/services/notification';

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
    const {
      technicalQuality = 5,
      punctuality = 5,
      communication = 5,
      professionalism = 5,
      priceTransparency = 5,
      overall,
      review,
    } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        worker: { include: { user: true } },
        customer: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const customerId = (session.user as any).customerId || booking.customerId;
    const overallScore = overall
      ? parseFloat(overall.toString())
      : Number(((technicalQuality + punctuality + communication + professionalism + priceTransparency) / 5).toFixed(1));

    const rating = await prisma.rating.upsert({
      where: { bookingId },
      create: {
        bookingId,
        customerId,
        workerId: booking.workerId,
        technicalQuality: parseInt(technicalQuality.toString()),
        punctuality: parseInt(punctuality.toString()),
        communication: parseInt(communication.toString()),
        professionalism: parseInt(professionalism.toString()),
        priceTransparency: parseInt(priceTransparency.toString()),
        overall: overallScore,
        review: review || null,
      },
      update: {
        technicalQuality: parseInt(technicalQuality.toString()),
        punctuality: parseInt(punctuality.toString()),
        communication: parseInt(communication.toString()),
        professionalism: parseInt(professionalism.toString()),
        priceTransparency: parseInt(priceTransparency.toString()),
        overall: overallScore,
        review: review || null,
      },
    });

    // Recompute worker average rating
    const allRatings = await prisma.rating.findMany({
      where: { workerId: booking.workerId },
      select: { overall: true },
    });
    const avg = allRatings.reduce((sum, r) => sum + r.overall, 0) / allRatings.length;

    await prisma.worker.update({
      where: { id: booking.workerId },
      data: {
        averageRating: Number(avg.toFixed(2)),
      },
    });

    if (booking.worker?.user?.id) {
      await sendNotification(
        booking.worker.user.id,
        'RATING',
        'New Customer Rating',
        `You received a ${overallScore}★ rating for Booking #${booking.id.slice(0, 8)}.`,
        { bookingId, rating: overallScore }
      );
    }

    return NextResponse.json({ success: true, rating }, { status: 201 });
  } catch (error: any) {
    console.error('Rating Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit rating' }, { status: 500 });
  }
}

