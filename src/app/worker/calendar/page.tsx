import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle2, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

export default async function CalendarPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const workerId = session.user.workerId;

  const bookings = await prisma.booking.findMany({
    where: workerId ? { workerId } : {},
    include: {
      category: true,
      customer: { include: { user: true } },
    },
    orderBy: { scheduledDate: 'asc' },
    take: 30,
  });

  const upcoming = bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED');
  const past = bookings.filter((b) => b.status === 'COMPLETED');

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Service Schedule & Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your daily appointments and track active bookings across Ahmedabad.
          </p>
        </div>
      </header>

      {/* Upcoming Jobs */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Active & Upcoming Bookings ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground text-sm">
              No upcoming appointments scheduled today.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((b) => (
              <Card key={b.id} className="border-primary/20 shadow-xs hover:border-primary/50 transition-all">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-base text-foreground">{b.category.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Booking #{b.id.slice(0, 8)}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary font-bold">{b.status}</Badge>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                      <span>{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : 'Scheduled'} at {b.scheduledTime || '10:00 AM'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-primary" />
                      <span>Customer: {b.customer?.user?.name || 'Customer'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      <span>{b.address || 'Address not provided'}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t flex justify-between items-center">
                    <span className="text-sm font-bold text-primary">₹{b.estimatedPrice || 450}</span>
                    <Link href={`/worker/jobs/${b.id}`}>
                      <Button size="sm" className="gap-1 text-xs">
                        Open Job Console <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Past Completed Jobs */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" /> Completed Jobs ({past.length})
        </h2>

        <div className="divide-y divide-border border rounded-xl bg-card">
          {past.slice(0, 10).map((b) => (
            <div key={b.id} className="p-4 flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-sm text-foreground">{b.category.name}</p>
                <p className="text-muted-foreground">{b.scheduledDate ? new Date(b.scheduledDate).toLocaleDateString() : 'Completed'} • {b.address || 'Address not provided'}</p>
              </div>
              <div className="text-right">
                <span className="font-bold text-green-600">₹{b.estimatedPrice || 450}</span>
                <Link href={`/worker/jobs/${b.id}`} className="block text-primary hover:underline mt-0.5">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


