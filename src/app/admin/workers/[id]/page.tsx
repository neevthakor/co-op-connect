import { notFound } from 'next/navigation';
import { getWorkerProfile } from '@/services/worker-profile';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/shared/stat-card';
import { TrustPassport } from '@/components/shared/trust-passport';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WorkerDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const workerId = resolvedParams.id;

  const profileData = await getWorkerProfile(workerId);

  if (!profileData) notFound();

  const { worker, completedJobsCount, averageRating, totalRatingsCount, earningsSummary } = profileData;

  const ratingDisplay = averageRating !== null ? `★ ${averageRating.toFixed(1)} (${totalRatingsCount})` : 'No reviews yet';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">{worker.user.name}</h1>
            <Badge className={
              worker.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }>
              {worker.verificationStatus}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {worker.primaryTrade || 'Technician'} • {worker.cooperative?.name || 'Ahmedabad Cooperative'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/workers">
            <Button variant="outline" size="sm">← Back to Workers</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Net Earnings" value={formatCurrency(earningsSummary.netTotal)} />
        <StatCard title="Total Jobs Completed" value={completedJobsCount.toString()} />
        <StatCard title="Average Rating" value={ratingDisplay} />
      </div>

      <TrustPassport profileData={profileData} />
    </div>
  );
}
