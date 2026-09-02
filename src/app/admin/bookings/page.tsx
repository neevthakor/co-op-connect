import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BookingsTable } from './bookings-table';

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) redirect('/login');

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cooperative Booking Orders</h1>
        <p className="text-sm text-gray-500">Live operational dispatch and order management</p>
      </div>

      <div className="bg-white p-5 rounded-xl border shadow-xs">
        <BookingsTable data={formattedData} />
      </div>
    </div>
  );
}
