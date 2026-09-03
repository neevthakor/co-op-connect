import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await Promise.resolve(params);
    const invoiceId = resolvedParams.id;

    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [{ id: invoiceId }, { bookingId: invoiceId }],
      },
      include: {
        items: true,
        booking: {
          include: {
            category: true,
            worker: { include: { user: true, cooperative: true } },
            customer: { include: { user: true } },
            payment: true,
            jobProofs: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const u = session.user as any;
    const isCustomer = u.customerId && invoice.booking?.customerId === u.customerId;
    const isWorker = u.workerId && invoice.booking?.workerId === u.workerId;
    const isAdmin = u.role === 'ADMIN' || u.role === 'COOPERATIVE_ADMIN';

    if (!isCustomer && !isWorker && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Invoice GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

