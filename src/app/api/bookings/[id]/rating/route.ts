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

    const resolvedParams = await params;
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

    // 1. Prevent reviewing an uncompleted job
    if (booking.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Reviews can only be submitted for completed jobs' },
        { status: 400 }
      );
    }

    // 2. Prevent reviewing a job that does not belong to this customer
    const sessionCustomerId = session.user.customerId;
    if (!sessionCustomerId || sessionCustomerId !== booking.customerId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only review your own bookings' },
        { status: 403 }
      );
    }

    // 3. Prevent duplicate review for the same booking
    const existingRating = await prisma.rating.findUnique({
      where: { bookingId },
    });
    if (existingRating) {
      return NextResponse.json(
        { error: 'A review has already been submitted for this booking' },
        { status: 400 }
      );
    }

    const customerId = booking.customerId;
    const computedScore = overall !== undefined && overall !== null
      ? parseFloat(overall.toString())
      : ((Number(technicalQuality) + Number(punctuality) + Number(communication) + Number(professionalism) + Number(priceTransparency)) / 5);
    const overallScore = Number(Math.max(1, Math.min(5, computedScore)).toFixed(1));

    const cleanedReview = typeof review === 'string' && review.trim().length > 0 ? review.trim() : null;

    const rating = await prisma.rating.create({
      data: {
        bookingId,
        customerId,
        workerId: booking.workerId,
        technicalQuality: Math.max(1, Math.min(5, parseInt(technicalQuality.toString(), 10))),
        punctuality: Math.max(1, Math.min(5, parseInt(punctuality.toString(), 10))),
        communication: Math.max(1, Math.min(5, parseInt(communication.toString(), 10))),
        professionalism: Math.max(1, Math.min(5, parseInt(professionalism.toString(), 10))),
        priceTransparency: Math.max(1, Math.min(5, parseInt(priceTransparency.toString(), 10))),
        overall: overallScore,
        review: cleanedReview,
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
  } catch (error) {
    console.error('Rating Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") || 'Failed to submit rating' }, { status: 500 });
  }
}

