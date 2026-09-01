import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DataTable } from '@/components/shared/data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Star, ShieldCheck, UserCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminWorkersPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const workers = await prisma.worker.findMany({
    include: {
      user: true,
      cooperative: true,
      earnings: true,
    },
    orderBy: { joinedAt: 'desc' },
  });

  const formattedData = workers.map((w) => {
    const totalEarnings = w.earnings.reduce((sum, e) => sum + e.netAmount, 0);
    return {
      id: w.id,
      name: w.user.name,
      trade: w.primaryTrade || 'General',
      cooperative: w.cooperative?.name || 'Ahmedabad Cooperative',
      verificationStatus: w.verificationStatus,
      availabilityStatus: w.availabilityStatus,
      rating: w.averageRating.toFixed(1),
      totalJobs: w.totalJobs,
      earnings: formatCurrency(totalEarnings),
    };
  });

  const columns = [
    {
      header: 'Worker Name',
      accessorKey: 'name',
      cell: (row: any) => (
        <div className="font-semibold text-gray-900">
          <Link href={`/admin/workers/${row.id}`} className="hover:text-primary hover:underline">
            {row.name}
          </Link>
          <div className="text-xs text-gray-500">{row.cooperative}</div>
        </div>
      ),
    },
    {
      header: 'Trade Skill',
      accessorKey: 'trade',
      cell: (row: any) => <Badge variant="outline" className="bg-gray-50 font-medium">{row.trade}</Badge>,
    },
    {
      header: 'Verification',
      accessorKey: 'verificationStatus',
      cell: (row: any) => (
        <Badge className={
          row.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-800' :
          row.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' :
          'bg-gray-100 text-gray-800'
        }>
          {row.verificationStatus}
        </Badge>
      ),
    },
    {
      header: 'Rating',
      accessorKey: 'rating',
      cell: (row: any) => (
        <span className="flex items-center text-amber-600 font-bold text-xs">
          <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
          {row.rating}
        </span>
      ),
    },
    {
      header: 'Jobs Done',
      accessorKey: 'totalJobs',
    },
    {
      header: 'Total Earnings',
      accessorKey: 'earnings',
      cell: (row: any) => <span className="font-bold text-gray-900">{row.earnings}</span>,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: (row: any) => (
        <Link href={`/admin/workers/${row.id}`}>
          <Button size="sm" variant="outline" className="text-xs">
            Inspect Profile
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cooperative Workforce Directory</h1>
          <p className="text-sm text-gray-500">Monitor active members, verified trades, and workload allocation</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/verification">
            <Button className="bg-primary text-white text-xs font-semibold gap-1.5">
              <UserCheck className="w-4 h-4" />
              Verification Queue
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border shadow-xs">
        <DataTable data={formattedData} columns={columns} searchable={true} filterable={true} />
      </div>
    </div>
  );
}
