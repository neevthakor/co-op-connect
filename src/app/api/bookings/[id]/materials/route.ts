import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { sendNotification } from '@/services/notification';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const bookingId = resolvedParams.id;

    const materials = await prisma.materialRequest.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(materials);
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
    const { item, quantity = 1, unitPrice, receiptUrl } = body;

    if (!item || !unitPrice) {
      return NextResponse.json({ error: 'item name and unitPrice are required' }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { include: { user: true } },
        worker: { include: { user: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const workerId = (session.user as any).workerId || booking.workerId;
    const qty = parseInt(quantity.toString()) || 1;
    const price = parseFloat(unitPrice.toString());
    const totalPrice = qty * price;

    const material = await prisma.materialRequest.create({
      data: {
        bookingId,
        workerId,
        item,
        quantity: qty,
        unitPrice: price,
        totalPrice,
        receiptUrl: receiptUrl || null,
        status: 'PENDING',
      },
    });

    // Notify customer
    if (booking.customer?.user?.id) {
      await sendNotification(
        booking.customer.user.id,
        'BOOKING',
        'Material Approval Requested',
        `${booking.worker.user.name} requested approval for replacement part: ${item} (₹${totalPrice}).`,
        { bookingId, materialId: material.id, amount: totalPrice }
      );
    }

    return NextResponse.json(material, { status: 201 });
  } catch (error: any) {
    console.error('Material Request Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create material request' }, { status: 500 });
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
    const bookingId = resolvedParams.id;
    const body = await req.json();
    const { materialId, status } = body; // 'APPROVED' or 'REJECTED'

    if (!materialId || !status) {
      return NextResponse.json({ error: 'materialId and status are required' }, { status: 400 });
    }

    const updated = await prisma.materialRequest.update({
      where: { id: materialId },
      data: {
        status: status.toUpperCase() === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        approvedAt: status.toUpperCase() === 'APPROVED' ? new Date() : null,
      },
      include: {
        booking: {
          include: {
            worker: { include: { user: true } },
          },
        },
      },
    });

    // Notify worker
    if (updated.booking.worker?.user?.id) {
      await sendNotification(
        updated.booking.worker.user.id,
        'BOOKING',
        `Material ${status.toUpperCase() === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        `Customer has ${status.toLowerCase()} material request: ${updated.item} (₹${updated.totalPrice}).`,
        { bookingId, materialId: updated.id, status }
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Material Approval Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update material request' }, { status: 500 });
  }
}

