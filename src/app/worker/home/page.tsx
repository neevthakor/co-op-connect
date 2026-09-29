import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Briefcase, CheckCircle2, MapPin, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { AvailabilityToggle } from '@/components/worker/availability-toggle';
import { cookies } from 'next/headers';
import { RealtimeBookingListener } from '@/components/shared/realtime-listeners';

export default async function WorkerHomePage() {
  const cookieStore = await cookies();
  const locale = cookieStore.get('locale')?.value || 'en';
  let tData: any = {};
  try {
    tData = (await import(`../../../../messages/${locale}.json`)).default?.WorkerDashboard || {};
  } catch(e) {
    tData = (await import(`../../../../messages/en.json`)).default?.WorkerDashboard || {};
  }
  const t = (key: string) => tData[key] || key;
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const workerId = (session.user as { workerId?: string }).workerId;
  
  type WorkerSummary = {
    id: string;
    primaryTrade: string | null;
    averageRating: number;
    verificationStatus: string;
    availabilityStatus: string;
    cooperative: { id: string; name: string } | null;
  };
  type ActiveBooking = {
    id: string;
    description: string | null;
    address: string | null;
    status: string;
    category: { name: string };
    customer: { user: { name: string | null } } | null;
  };
  type Disbursement = {
    id: string;
    type: string;
    amount: number;
    description: string | null;
    date: Date;
  };

  let worker: WorkerSummary | null = null;
  let todayEarnings = 0;
  let activeBookings: ActiveBooking[] = [];
  let completedJobsCount = 0;
  let disbursements: Disbursement[] = [];

  let topRequirements: { name: string; count: number }[] = [];

  if (workerId) {
    const start = Date.now();
    // Group 1: Worker state
    const [workerData, bookingsData] = await Promise.all([
      prisma.worker.findUnique({
        where: { id: workerId },
        select: {
          id: true,
          primaryTrade: true,
          averageRating: true,
          verificationStatus: true,
          availabilityStatus: true,
          cooperative: { select: { id: true, name: true } },
        },
      }),
      prisma.booking.findMany({
        where: {
          workerId,
          status: { in: ['REQUESTED', 'ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'] },
        },
        select: {
          id: true,
          description: true,
          address: true,
          status: true,
          category: { select: { name: true } },
          customer: { select: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      })
    ]);

    // Group 2: Stats
    const [earningsAgg, jobsCount, topReqsGroups, workerDisbursements] = await Promise.all([
      prisma.workerEarning.aggregate({
        where: {
          workerId,
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        _sum: { netAmount: true },
      }),
      prisma.booking.count({
        where: { workerId, status: 'COMPLETED' },
      }),
      prisma.booking.groupBy({
        by: ['categoryId'],
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 3,
      }),
      (prisma as any).welfareDisbursement.findMany({
        where: { workerId },
        orderBy: { date: 'desc' },
        take: 10,
      })
    ]);

    const allCategories = await prisma.serviceCategory.findMany({
      where: { id: { in: topReqsGroups.map((r: any) => r.categoryId) } },
      select: { id: true, name: true }
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DB] worker home: ${Date.now() - start}ms`);
    }

    worker = workerData;
    activeBookings = bookingsData;
    todayEarnings = earningsAgg._sum.netAmount || 0;
    completedJobsCount = jobsCount;
    disbursements = workerDisbursements;

    topRequirements = topReqsGroups.map((req: any) => ({
      name: allCategories.find(c => c.id === req.categoryId)?.name || req.categoryId,
      count: req._count.categoryId
    }));
  }

  const ratingDisplay =
    worker?.averageRating && worker.averageRating > 0
      ? `★ ${worker.averageRating.toFixed(1)}`
      : 'No ratings yet';

  return (
    <div className="page-container space-y-6 py-5 pb-24 md:py-8 lg:pb-8">
      {workerId && <RealtimeBookingListener referenceId={workerId} role="worker" />}
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border/80 bg-card p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {t('welcome')}, {session.user.name || 'Worker'}!
            </h1>
            <Badge className="flex items-center gap-1 border border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/15 dark:text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Worker
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {worker?.primaryTrade || 'Technician'} • {worker?.cooperative?.name || 'Ahmedabad Cooperative'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {worker?.verificationStatus === 'VERIFIED' ? (
            <AvailabilityToggle workerId={worker.id} initialStatus={worker.availabilityStatus} />
          ) : (
            <span className="rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-700 dark:text-orange-300">
              ● PENDING VERIFICATION
            </span>
          )}
        </div>
      </div>

      {worker?.verificationStatus !== 'VERIFIED' && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-500/25 bg-orange-500/10 p-4">
          <div className="mt-0.5 font-bold text-orange-700 dark:text-orange-300">!</div>
          <div>
            <h3 className="text-sm font-bold text-orange-800 dark:text-orange-200">Your profile is pending verification</h3>
            <p className="mt-1 text-xs text-orange-700 dark:text-orange-300">
              You will not be visible to customers until a cooperative admin verifies your identity and skills.
              Please ensure your profile is complete.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title={t('earnings')} value={formatCurrency(todayEarnings)} />
        <StatCard title={t('activeJobs')} value={activeBookings.length.toString()} />
        <StatCard title="Overall Rating" value={ratingDisplay} />
        <StatCard title="Completed Jobs" value={completedJobsCount.toString()} />
      </div>

      {/* Active Jobs Queue */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <Briefcase className="w-5 h-5 text-green-600" />
            Assigned Work Orders
          </h2>
            <Link href="/worker/jobs" className="text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-300">
            View All Jobs →
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <Card className="border-border/80 bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-muted-foreground/40" />
            <h3 className="font-semibold text-foreground">No active work orders right now</h3>
            <p className="mt-1 text-xs text-muted-foreground">You are available. New requests from cooperative customers will appear here.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((b) => (
              <Card key={b.id} className="border-border/80 bg-card transition-all hover:border-emerald-500/40">
                <CardContent className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="border border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-300">{b.category.name}</Badge>
                      <span className="rounded bg-orange-500/10 px-2 py-0.5 text-xs font-bold text-orange-700 dark:text-orange-300">
                        {b.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-foreground">{b.description || 'Household Service Request'}</h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      {b.address || 'Address not provided'} • Customer: {b.customer?.user?.name || 'Customer'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link href={`/worker/jobs/${b.id}`} className="w-full sm:w-auto">
                      <Button className="w-full bg-emerald-600 text-white hover:bg-emerald-700">
                        Open Job Console
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Top Customer Requirements */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <MapPin className="w-5 h-5 text-blue-600" />
            Top Customer Requirements (Overall Demand)
          </h2>
        </div>
        
        {topRequirements.length === 0 ? (
          <Card className="border-border/80 bg-card p-8 text-center">
            <h3 className="font-semibold text-foreground">No demand data available</h3>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topRequirements.map((req, idx) => (
              <Card key={idx} className="border-blue-500/20 bg-blue-500/5 transition-all hover:border-blue-500/40">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <span className="font-semibold text-foreground">{req.name}</span>
                  <Badge className="border border-blue-500/25 bg-blue-500/10 text-blue-700 hover:bg-blue-500/15 dark:text-blue-300">{req.count} requests</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Welfare Disbursements Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            My Welfare Benefits
          </h2>
        </div>
        
        {disbursements.length === 0 ? (
          <Card className="border-border/80 bg-card p-8 text-center">
            <h3 className="font-semibold text-foreground">No benefits disbursed yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">Keep completing jobs to become eligible for insurance and training subsidies.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {disbursements.map((d) => (
              <Card key={d.id} className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-300">
                      {d.type.replace('_', ' ')}
                    </h3>
                    <p className="text-xs text-muted-foreground">{d.description || 'Benefit Disbursed'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(d.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(d.amount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

