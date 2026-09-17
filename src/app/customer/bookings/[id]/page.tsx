import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { BookingTimeline } from '@/components/shared/booking-timeline';
import { ServicePinDisplay } from '@/components/shared/service-pin-display';
import { ProofGallery } from '@/components/shared/proof-gallery';
import { InvoiceView } from '@/components/shared/invoice-view';
import { PaymentSummary } from '@/components/shared/payment-summary';
import { RatingInput } from '@/components/shared/rating-input';
import { MaterialApproval } from '@/components/shared/material-approval';
import { WorkerCard } from '@/components/shared/worker-card';
import { CustomerBookingActions } from '@/components/customer/customer-booking-actions';
import { RealtimeBookingListener } from '@/components/shared/realtime-listeners';
import { LiveMap } from '@/components/shared/live-map';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Map, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { SOSButton } from '@/components/safety/SOSButton';

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const bookingId = resolvedParams.id;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      category: true,
      worker: {
        include: {
          user: true,
          cooperative: true,
        },
      },
      materialRequests: true,
      invoice: {
        include: {
          items: true,
        },
      },
      jobProofs: true,
      rating: true,
      payment: true,
      warranty: true,
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!booking) notFound();

  const isCompleted = booking.status === 'COMPLETED';
  const showPin = ['ACCEPTED', 'TRAVELLING', 'ARRIVED'].includes(booking.status);
  const isTravelling = booking.status === 'TRAVELLING';
  const isCancellable = !isCompleted && booking.status !== 'CANCELLED';

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-3xl mx-auto w-full">
      <RealtimeBookingListener userId={session.user?.id as string} role="customer" />
      
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Booking #{booking.id.slice(0, 8)}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
              {booking.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{booking.category.name} • {booking.address || 'Ahmedabad'}</p>
        </div>
        <div className="flex gap-2">
          {isCancellable && (
            <SOSButton bookingId={booking.id} />
          )}
          {isCompleted && (
            <Link href={`/customer/book?query=${encodeURIComponent(booking.category.name)}`}>
              <Button variant="outline" size="sm">Book Again</Button>
            </Link>
          )}
        </div>
      </header>

      {/* Booking status timeline */}
      <section className="bg-card p-5 rounded-xl border shadow-xs">
        <h3 className="font-bold text-sm text-foreground mb-4">Job Status History</h3>
        <BookingTimeline statusHistory={booking.statusHistory} />
      </section>

      {showPin && (
        <section className="bg-card p-5 rounded-xl border shadow-xs text-center">
          <ServicePinDisplay pin={booking.servicePin || '4827'} />
          <p className="text-xs text-muted-foreground mt-2">
            Share this 4-digit security PIN with the worker when they arrive at your location to begin work.
          </p>
        </section>
      )}

      {isTravelling && booking.worker && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-sm flex items-center gap-2 text-primary">
                <Map className="h-4 w-4" /> Live Worker Tracking
              </h3>
            </div>
            <LiveMap 
              height="200px"
              center={
                booking.worker.latitude && booking.worker.longitude
                  ? [booking.worker.latitude, booking.worker.longitude]
                  : booking.latitude && booking.longitude 
                    ? [booking.latitude, booking.longitude]
                    : undefined
              }
              markers={[
                ...(booking.latitude && booking.longitude ? [{
                  lat: booking.latitude,
                  lng: booking.longitude,
                  label: "Service Location",
                }] : []),
                ...(booking.worker.latitude && booking.worker.longitude ? [{
                  lat: booking.worker.latitude,
                  lng: booking.worker.longitude,
                  label: `${booking.worker.user.name || 'Worker'} (En Route)`,
                  isWorker: true,
                }] : [])
              ]}
            />
          </CardContent>
        </Card>
      )}

      {booking.worker && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Assigned Worker</h2>
          <WorkerCard worker={booking.worker} href={`/customer/workers/${booking.worker.id}`} />
        </section>
      )}

      {booking.materialRequests && booking.materialRequests.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Additional Material Approvals</h2>
          <div className="flex flex-col gap-3">
            {booking.materialRequests.map((mat: any) => (
              <MaterialApproval key={mat.id} material={mat} bookingId={booking.id} />
            ))}
          </div>
        </section>
      )}

      {booking.jobProofs && booking.jobProofs.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Before & After Job Proof</h2>
          <ProofGallery proofs={booking.jobProofs} />
        </section>
      )}

      {isCompleted && booking.invoice && (
        <section className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Digital Tax Invoice</h2>
          <InvoiceView invoice={booking.invoice} />
          {booking.payment && <PaymentSummary payment={booking.payment} />}
        </section>
      )}

      {isCompleted && booking.warranty && (
        <Card className="border-green-500/30 bg-green-500/5 p-4">
          <CardContent className="p-0 flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="font-bold text-sm text-green-800">Cooperative Service Warranty Active</p>
              <p className="text-xs text-green-700">
                Valid until {new Date(booking.warranty.expiryDate).toLocaleDateString()}. Free rework covered by cooperative quality guarantee.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isCompleted && !booking.rating && (
        <section className="space-y-3 mt-2">
          <RatingInput bookingId={booking.id} />
        </section>
      )}

      <CustomerBookingActions
        bookingId={booking.id}
        invoice={booking.invoice}
        payment={booking.payment}
        status={booking.status}
      />
    </div>
  );
}

