import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/shared/stat-card';
import { TrustPassport } from '@/components/shared/trust-passport';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WorkerDetailPage({ params }: { params: { id: string } }) {
  const worker = await prisma.worker.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      cooperative: true,
      skills: {
        include: {
          skill: true,
        },
      },
      certifications: {
        include: {
          certification: true,
        },
      },
      earnings: true,
    },
  });

  if (!worker) notFound();

  const totalEarnings = worker.earnings.reduce((sum, e) => sum + e.netAmount, 0);

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
            {worker.primaryTrade} • {worker.cooperative?.name || 'Ahmedabad Cooperative'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/workers">
            <Button variant="outline" size="sm">← Back to Workers</Button>
          </Link>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Net Earnings" value={formatCurrency(totalEarnings)} />
        <StatCard title="Total Jobs Completed" value={worker.totalJobs.toString()} />
        <StatCard title="Average Rating" value={`★ ${worker.averageRating.toFixed(1)}`} />
      </div>

      <TrustPassport worker={worker} />
    </div>
  );
}
