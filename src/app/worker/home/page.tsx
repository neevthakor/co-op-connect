import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Briefcase, CheckCircle2, Clock, MapPin, IndianRupee, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function WorkerHomePage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  
  const workerId = (session.user as any).workerId;
  
  let worker: any = null;
  let todayEarnings = 0;
  let activeBookings: any[] = [];
  let completedJobsCount = 0;

  if (workerId) {
    const [workerData, bookingsData, earningsAgg, jobsCount] = await Promise.all([
      prisma.worker.findUnique({
        where: { id: workerId },
        select: {
          id: true,
          primaryTrade: true,
          averageRating: true,
          verificationStatus: true,
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
      }),
      prisma.workerEarning.aggregate({
        where: {
          workerId,
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        _sum: { netAmount: true },
      }),
      prisma.booking.count({
        where: { workerId, status: 'COMPLETED' },
      })
    ]);

    worker = workerData;
    activeBookings = bookingsData;
    todayEarnings = earningsAgg._sum.netAmount || 0;
    completedJobsCount = jobsCount;
  }

  const ratingDisplay =
    worker?.averageRating && worker.averageRating > 0
      ? `★ ${worker.averageRating.toFixed(1)}`
      : 'No ratings yet';

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {session.user.name || 'Worker'}!
            </h1>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Worker
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {worker?.primaryTrade || 'Technician'} • {worker?.cooperative?.name || 'Ahmedabad Cooperative'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {worker?.verificationStatus === 'VERIFIED' ? (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200">
              ● AVAILABLE FOR JOBS
            </span>
          ) : (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
              ● PENDING VERIFICATION
            </span>
          )}
        </div>
      </div>

      {worker?.verificationStatus !== 'VERIFIED' && (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex items-start gap-3">
          <div className="text-orange-600 font-bold mt-0.5">!</div>
          <div>
            <h3 className="text-sm font-bold text-orange-800">Your profile is pending verification</h3>
            <p className="text-xs text-orange-700 mt-1">
              You will not be visible to customers until a cooperative admin verifies your identity and skills.
              Please ensure your profile is complete.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Today's Net Earnings" value={formatCurrency(todayEarnings)} />
        <StatCard title="Active Jobs" value={activeBookings.length.toString()} />
        <StatCard title="Overall Rating" value={ratingDisplay} />
        <StatCard title="Completed Jobs" value={completedJobsCount.toString()} />
      </div>

      {/* Active Jobs Queue */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-green-600" />
            Assigned Work Orders
          </h2>
          <Link href="/worker/jobs" className="text-sm font-semibold text-green-600 hover:underline">
            View All Jobs →
          </Link>
        </div>

        {activeBookings.length === 0 ? (
          <Card className="bg-white text-center p-8 border">
            <CheckCircle2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-700">No active work orders right now</h3>
            <p className="text-xs text-gray-400 mt-1">You are available. New requests from cooperative customers will appear here.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeBookings.map((b) => (
              <Card key={b.id} className="bg-white hover:border-green-300 transition-all border shadow-xs">
                <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">{b.category.name}</Badge>
                      <span className="text-xs font-bold text-orange-600 px-2 py-0.5 bg-orange-50 rounded">
                        {b.status}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{b.description || 'Household Service Request'}</h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {b.address || 'Address not provided'} • Customer: {b.customer?.user?.name || 'Customer'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link href={`/worker/jobs/${b.id}`} className="w-full sm:w-auto">
                      <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
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
    </div>
  );
}

