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
import { AlertTriangle, Sparkles } from 'lucide-react';
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
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full">
      {/* Personalized Greeting Header */}
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-foreground">
              Hello, {session.user.name || 'Cooperator'}! 👋
            </h1>
          </div>
          <p className="text-muted-foreground text-xs md:text-sm mt-0.5">
            Verified cooperative services & fair-wage technicians in your area.
          </p>
        </div>
        <Link href="/customer/profile" className="shrink-0">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold text-base hover:scale-105 transition-transform">
            {session.user.name?.charAt(0) || 'U'}
          </div>
        </Link>
      </header>

      {/* AI Concierge Hero Card */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/5 border border-primary/25 p-4 md:p-5 shadow-lg shadow-primary/5">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-sm md:text-base text-foreground">Cooperative AI Concierge</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-full">
            Gemini Powered
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Describe any household or maintenance problem by text or voice in English, Hindi, or Gujarati.
        </p>
        <AIConciergeSearch />
      </section>

      {/* Emergency Quick Action */}
      <section>
        <Link href="/customer/emergency" className="block group">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 hover:border-destructive/60 hover:bg-destructive/15 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-destructive flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">Need Urgent Emergency Help?</p>
                <p className="text-xs text-muted-foreground">Rapid-dispatch electricians, plumbers, and emergency repair</p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-xs font-bold text-destructive group-hover:translate-x-0.5 transition-transform">
              Request Emergency &rarr;
            </span>
          </div>
        </Link>
      </section>

      {/* Active Bookings (if any) */}
      {activeBookings.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Active Bookings
            </h2>
            <Link href="/customer/bookings" className="text-xs text-primary font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {activeBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      {/* Popular Services */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-foreground">Popular Cooperative Services</h2>
          <Link href="/customer/services" className="text-xs text-primary font-semibold hover:underline">
            View All Services &rarr;
          </Link>
        </div>
        {popularServices.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 md:gap-4">
            {popularServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <EmptyState title="No services found" description="Check back later." />
        )}
      </section>

      {/* Nearby Verified Workers */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-bold text-foreground">Nearby Verified Workers</h2>
          <Link href="/customer/services" className="text-xs text-primary font-semibold hover:underline">
            Browse All &rarr;
          </Link>
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

      {/* Recent Services */}
      {recentBookings.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Recent Services</h2>
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
