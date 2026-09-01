import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { DataTable } from '@/components/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const bookings = await prisma.booking.findMany({
    include: {
      customer: { include: { user: true } },
      worker: { include: { user: true } },
      category: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  const formattedData = bookings.map((b) => ({
    id: b.id,
    customer: b.customer?.user?.name || 'Customer',
    worker: b.worker?.user?.name || 'Unassigned',
    category: b.category?.name || 'Service',
    status: b.status,
    date: formatDate(b.createdAt),
    amount: formatCurrency(b.finalPrice || b.estimatedPrice || b.category?.basePrice || 350),
  }));

  const columns = [
    {
      header: 'Booking ID',
      accessorKey: 'id',
      cell: (row: any) => <span className="font-mono text-xs font-semibold text-gray-700">#{row.id.slice(0, 10)}</span>,
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
      cell: (row: any) => <span className="font-medium text-gray-900">{row.customer}</span>,
    },
    {
      header: 'Assigned Worker',
      accessorKey: 'worker',
      cell: (row: any) => <span className="text-gray-700">{row.worker}</span>,
    },
    {
      header: 'Service Category',
      accessorKey: 'category',
      cell: (row: any) => <Badge variant="outline" className="bg-gray-50">{row.category}</Badge>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: any) => (
        <Badge className={getStatusColor(row.status)}>
          {row.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      header: 'Booking Date',
      accessorKey: 'date',
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row: any) => <span className="font-bold text-gray-900">{row.amount}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cooperative Booking Orders</h1>
        <p className="text-sm text-gray-500">Live operational dispatch and order management</p>
      </div>

      <div className="bg-white p-5 rounded-xl border shadow-xs">
        <DataTable data={formattedData} columns={columns} searchable={true} filterable={true} />
      </div>
    </div>
  );
}
