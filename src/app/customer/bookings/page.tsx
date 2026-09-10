import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BookingCard } from '@/components/shared/booking-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function BookingsPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const customerId = session.user.customerId;

  const allBookings = customerId
    ? await prisma.booking.findMany({
        where: { customerId },
        include: {
          category: true,
          worker: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const active = allBookings.filter(b => ['REQUESTED', 'ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(b.status));
  const upcoming = allBookings.filter(b => ['REQUESTED', 'ACCEPTED'].includes(b.status));
  const completed = allBookings.filter(b => b.status === 'COMPLETED');

  const renderList = (list: any[]) => {
    if (list.length === 0) return <EmptyState title="No bookings found" description="You don't have any bookings in this category." />;
    return (
      <div className="flex flex-col gap-4 mt-4">
        {list.map(booking => (
          <BookingCard key={booking.id} booking={booking} href={`/customer/bookings/${booking.id}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-7xl mx-auto w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight mb-2">My Bookings</h1>
        <p className="text-muted-foreground">Manage your service requests and history.</p>
      </header>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="w-full grid grid-cols-4 h-auto p-1">
          <TabsTrigger value="active" className="py-2 text-xs sm:text-sm">Active</TabsTrigger>
          <TabsTrigger value="upcoming" className="py-2 text-xs sm:text-sm">Upcoming</TabsTrigger>
          <TabsTrigger value="completed" className="py-2 text-xs sm:text-sm">Past</TabsTrigger>
          <TabsTrigger value="all" className="py-2 text-xs sm:text-sm">All</TabsTrigger>
        </TabsList>
        <TabsContent value="active">{renderList(active)}</TabsContent>
        <TabsContent value="upcoming">{renderList(upcoming)}</TabsContent>
        <TabsContent value="completed">{renderList(completed)}</TabsContent>
        <TabsContent value="all">{renderList(allBookings)}</TabsContent>
      </Tabs>
    </div>
  );
}
