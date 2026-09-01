import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { EarningsLedger } from '@/components/shared/earnings-ledger';
import { Card, CardContent } from '@/components/ui/card';
import { IndianRupee, ShieldCheck, HeartHandshake, ArrowUpRight } from 'lucide-react';

export default async function EarningsPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const workerId = (session.user as any).workerId;

  const earnings = await prisma.workerEarning.findMany({
    where: workerId ? { workerId } : {},
    orderBy: { date: 'desc' },
    take: 50,
  });

  const totals = earnings.reduce(
    (acc, curr) => ({
      gross: acc.gross + curr.grossAmount,
      cooperative: acc.cooperative + curr.cooperativeDeduction,
      welfare: acc.welfare + curr.welfareDeduction,
      net: acc.net + curr.netAmount,
    }),
    { gross: 0, cooperative: 0, welfare: 0, net: 0 }
  );

  const formattedEarnings = earnings.map((e) => ({
    id: e.id,
    date: e.date,
    description: e.description || 'Service Execution',
    gross: e.grossAmount,
    deductions: {
      cooperative: e.cooperativeDeduction,
      welfare: e.welfareDeduction,
    },
    net: e.netAmount,
  }));

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Earnings & Cooperative Ledger</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transparent breakdown of your service revenue, 5% cooperative reinvestment, and 2% welfare fund.
          </p>
        </div>
      </header>

      <EarningsLedger
        earnings={formattedEarnings}
        period="Last 30 Days"
        totals={totals}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-5 flex items-start gap-3">
            <HeartHandshake className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-foreground">Worker Welfare Fund Benefits</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Your 2% contribution (₹{totals.welfare.toLocaleString()}) funds accident insurance, health emergency relief, and vocational skill certifications for cooperative members.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/30 border">
          <CardContent className="p-5 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-foreground shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-foreground">Weekly Direct Payouts</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Net earnings of ₹{totals.net.toLocaleString()} are settled directly to your registered UPI / bank account with 0% platform profit extraction.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

