import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AIConciergeSearch } from '@/components/customer/ai-concierge-search';
import { ServiceCard } from '@/components/shared/service-card';
import { BookingCard } from '@/components/shared/booking-card';
import { WorkerCard } from '@/components/shared/worker-card';
import { EmptyState } from '@/components/shared/empty-state';
import { AlertTriangle } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export default async function CustomerHomePage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const customerId = (session.user as any).customerId;

  const [activeBookings, popularServices, nearbyWorkers, recentBookings] = await Promise.all([
    customerId
      ? prisma.booking.findMany({
          where: {
            customerId,
            status: { in: ['REQUESTED', 'ACCEPTED', 'TRAVELLING', 'ARRIVED', 'IN_PROGRESS'] },
          },
          include: {
            category: true,
            worker: { include: { user: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        })
      : [],
    prisma.serviceCategory.findMany({
      where: { isActive: true, isEmergency: false },
      take: 6,
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.worker.findMany({
      where: { verificationStatus: 'VERIFIED' },
      include: {
        user: true,
        cooperative: true,
      },
      take: 6,
      orderBy: { averageRating: 'desc' },
    }),
    customerId
      ? prisma.booking.findMany({
          where: {
            customerId,
            status: 'COMPLETED',
          },
          include: {
            category: true,
            worker: { include: { user: true } },
          },
          orderBy: { completedAt: 'desc' },
          take: 3,
        })
      : [],
  ]);

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-7xl mx-auto w-full">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hello, {session.user.name || 'User'}! 👋</h1>
          <p className="text-muted-foreground text-sm">Find trusted cooperative workers near you.</p>
        </div>
        <Link href="/customer/profile">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {session.user.name?.charAt(0) || 'U'}
          </div>
        </Link>
      </header>

      <section className="flex flex-col gap-3">
        <AIConciergeSearch />
        <Link href="/customer/emergency" className="w-full">
          <Button variant="destructive" className="w-full h-12 rounded-xl gap-2 font-semibold">
            <AlertTriangle className="h-5 w-5" />
            EMERGENCY SERVICE
          </Button>
        </Link>
      </section>

      {activeBookings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Active Bookings</h2>
          <div className="flex flex-col gap-3">
            {activeBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Popular Services</h2>
          <Link href="/customer/services" className="text-sm text-primary font-medium">View All</Link>
        </div>
        {popularServices.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <EmptyState title="No services found" description="Check back later." />
        )}
      </section>

      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Nearby Verified Workers</h2>
        </div>
        {nearbyWorkers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nearbyWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        ) : (
          <EmptyState title="No nearby workers" description="We couldn't find any verified workers in your area." />
        )}
      </section>

      {recentBookings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-3">Recent Services</h2>
          <div className="flex flex-col gap-3">
            {recentBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
