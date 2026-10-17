import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole, handleApiError, getScope, validateClientCooperativeId } from '@/lib/scope';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await requireRole('ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN');
    const scope = await getScope(sessionUser);

    const { searchParams } = new URL(req.url);
    const clientCoopId = searchParams.get('cooperativeId');
    let cooperativeId: string | undefined;
    
    try {
      cooperativeId = validateClientCooperativeId(scope, clientCoopId);
    } catch (error: any) {
    return handleApiError(error);
  }

    const workerFilter = cooperativeId ? { cooperativeId } : (
      scope.role === 'ADMIN' ? {} : 
      (scope.role === 'COOPERATIVE_ADMIN' ? { cooperativeId: scope.cooperativeId } : { cooperativeId: { in: scope.cooperativeIds } })
    );

    const [earningsSum, earnings, invoices, payments, pendingPayouts] = await Promise.all([
      prisma.workerEarning.aggregate({
        where: { worker: workerFilter },
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
        where: { worker: workerFilter },
        include: {
          worker: { include: { user: { select: { name: true } } } },
        },
        orderBy: { date: 'desc' },
        take: 30,
      }),
      prisma.invoice.findMany({
        where: { booking: { worker: workerFilter } },
        include: { booking: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.payment.findMany({
        where: { booking: { worker: workerFilter } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.payout.findMany({
        where: { status: 'HELD', workerEarning: { worker: workerFilter } },
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
  } catch (error: any) {
    return handleApiError(error);
  }
}


