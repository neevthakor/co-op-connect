import { prisma } from '@/lib/prisma';
import { LiveMap } from '@/components/shared/live-map';

export default async function LiveMapPage() {
  const [workers, bookings] = await Promise.all([
    prisma.worker.findMany({
      where: { latitude: { not: null }, longitude: { not: null }, availabilityStatus: 'AVAILABLE' },
      include: { user: true }
    }),
    prisma.booking.findMany({
      where: { 
        status: { in: ['REQUESTED', 'ACCEPTED', 'TRAVELLING'] },
        latitude: { not: null }, 
        longitude: { not: null } 
      },
      include: { customer: { include: { user: true } } }
    })
  ]);

  const markers = [
    ...workers.map(w => ({
      lat: w.latitude!,
      lng: w.longitude!,
      label: `Worker: ${w.user?.name || 'Unknown'} (${w.primaryTrade})`,
      isWorker: true
    })),
    ...bookings.map(b => ({
      lat: b.latitude!,
      lng: b.longitude!,
      label: `Demand: ${b.customer?.user?.name || 'Unknown'} - ${b.status}`,
      isWorker: false
    }))
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Live Demand-Supply Map</h1>
      <div className="p-4 bg-muted/20 border rounded-xl flex items-center justify-center min-h-[600px] flex-col">
        {markers.length > 0 ? (
          <LiveMap markers={markers} height="600px" />
        ) : (
          <p className="text-lg text-muted-foreground">No active workers or demand found with location data.</p>
        )}
      </div>
    </div>
  );
}
