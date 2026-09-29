import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const userRole = session?.user?.role;
    if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cooperativeId = searchParams.get('cooperativeId') || session.user.cooperativeId;

    const [earningsSum, earnings, invoices, payments, pendingPayouts] = await Promise.all([
      prisma.workerEarning.aggregate({
        where: cooperativeId ? { worker: { cooperativeId } } : {},
        _sum: {
          grossAmount: true,
          labourAmount: true,
          travelAmount: true,
          materialAmount: true,
          cooperativeDeduction: true,
          welfareDeduction: true,
          netAmount: true,
        },
      }),
      prisma.workerEarning.findMany({
        where: cooperativeId ? { worker: { cooperativeId } } : {},
        include: {
          worker: { include: { user: { select: { name: true } } } },
        },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.invoice.findMany({
        where: cooperativeId ? { booking: { worker: { cooperativeId } } } : {},
        include: { booking: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.payment.findMany({
        where: cooperativeId ? { booking: { worker: { cooperativeId } } } : {},
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.payout.findMany({
        where: cooperativeId 
          ? { status: 'HELD', workerEarning: { worker: { cooperativeId } } }
          : { status: 'HELD' },
        include: {
          workerEarning: {
            include: { worker: { include: { user: { select: { name: true } } } } }
          }
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      }),
    ]);

    const gross = earningsSum._sum.grossAmount || 0;
    const net = earningsSum._sum.netAmount || 0;
    const coopFund = earningsSum._sum.cooperativeDeduction || 0;
    const welfareFund = earningsSum._sum.welfareDeduction || 0;

    // Honest insufficient historical data state if there are no earnings
    const monthlyData = gross === 0 ? [] : [
      { month: 'Latest', revenue: gross, coopFund, welfareFund }
    ];

    return NextResponse.json({
      summary: {
        grossRevenue: gross,
        netTakeHome: net,
        cooperativeFund: coopFund,
        welfareFund: welfareFund,
        taxCollected: Math.round(gross * 0.05),
      },
      monthlyData,
      recentEarnings: earnings,
      recentInvoices: invoices,
      recentPayments: payments,
      pendingPayouts,
    });
  } catch (error) {
    console.error('Finance API Error:', error);
    return NextResponse.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : "Unknown error") : "Unknown error") }, { status: 500 });
  }
}


