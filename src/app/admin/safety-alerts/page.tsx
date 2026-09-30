import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SafetyAlertsPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? '';

  if (!session?.user || !['ADMIN', 'COOPERATIVE_ADMIN', 'FEDERATION_ADMIN'].includes(userRole)) {
    redirect('/login');
  }

  // Fetch SAFETY category complaints
  const safetyComplaints = await prisma.complaint.findMany({
    where: { category: 'SAFETY' },
    include: {
      customer: { include: { user: true } },
      worker: { include: { user: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch EMERGENCY notifications
  const emergencyNotifications = await prisma.notification.findMany({
    where: { type: 'EMERGENCY' },
    include: {
      user: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-8 h-8 text-red-600" />
        <h1 className="text-2xl font-bold text-red-900">Safety Alerts & Emergencies</h1>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" /> 
            SOS / Emergency Notifications
          </h2>
          {emergencyNotifications.length === 0 ? (
            <p className="text-muted-foreground">No emergency notifications.</p>
          ) : (
            <div className="space-y-4">
              {emergencyNotifications.map((notif: any) => (
                <Card key={notif.id} className="border-red-200 bg-red-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-red-800 flex justify-between">
                      {notif.title}
                      <Badge variant="destructive">EMERGENCY</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-semibold mb-2">{notif.body}</p>
                    <p className="text-xs text-muted-foreground">User ID: {notif.userId}</p>
                    <p className="text-xs text-muted-foreground">Date: {new Date(notif.createdAt).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" /> 
            Safety Complaints
          </h2>
          {safetyComplaints.length === 0 ? (
            <p className="text-muted-foreground">No safety complaints logged.</p>
          ) : (
            <div className="space-y-4">
              {safetyComplaints.map((comp: any) => (
                <Card key={comp.id} className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-orange-900 flex justify-between">
                      Safety Incident
                      <Badge className={comp.status === 'OPEN' ? 'bg-red-600' : 'bg-green-600'}>{comp.status}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{comp.description}</p>
                    <div className="text-xs text-slate-600 flex flex-col gap-1">
                      <span>Booking ID: {comp.bookingId || 'N/A'}</span>
                      <span>Customer: {comp.customer?.user?.name || 'N/A'}</span>
                      <span>Worker: {comp.worker?.user?.name || 'N/A'}</span>
                      <span>Date: {new Date(comp.createdAt).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
