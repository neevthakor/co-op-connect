import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MapPin, Calendar, Clock, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function WorkerJobsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const workerId = (session.user as any).workerId;

  const bookings = workerId
    ? await prisma.booking.findMany({
        where: { workerId },
        include: {
          category: true,
          customer: { include: { user: true } },
        },
        orderBy: { createdAt: 'desc' },
      })
    : [];

  const requested = bookings.filter((b) => b.status === 'REQUESTED');
  const accepted = bookings.filter((b) => b.status === 'ACCEPTED');
  const active = bookings.filter((b) => ['TRAVELLING', 'ARRIVED', 'IN_PROGRESS'].includes(b.status));
  const completed = bookings.filter((b) => ['COMPLETED', 'CANCELLED'].includes(b.status));

  const renderJobCard = (b: any) => (
    <Card key={b.id} className="bg-white border shadow-xs">
      <CardContent className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">{b.category.name}</Badge>
            <Badge variant="outline" className="text-xs font-semibold">{b.status}</Badge>
          </div>
          <h3 className="font-bold text-gray-900">{b.description || 'Household Service Request'}</h3>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            {b.address || 'Address not provided'} • Customer: {b.customer?.user?.name || 'Customer'}
          </p>
          <div className="flex items-center gap-3 pt-1 text-xs text-gray-600">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{formatDate(b.createdAt)}</span>
            <span className="flex items-center gap-1 font-semibold text-green-700">
              Est. {formatCurrency(b.estimatedPrice || b.category.basePrice || 350)}
            </span>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <Link href={`/worker/jobs/${b.id}`} className="w-full sm:w-auto">
            <Button className="bg-green-600 hover:bg-green-700 text-white w-full">
              Open Job
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6 pb-24 lg:pb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Job Console</h1>
        <p className="text-sm text-gray-500">Manage incoming service requests and active tasks</p>
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="w-full justify-between bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="active" className="flex-1">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="new" className="flex-1">New ({requested.length})</TabsTrigger>
          <TabsTrigger value="accepted" className="flex-1">Accepted ({accepted.length})</TabsTrigger>
          <TabsTrigger value="completed" className="flex-1">Completed ({completed.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-3">
          {active.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">No jobs currently in progress.</Card>
          ) : (
            active.map(renderJobCard)
          )}
        </TabsContent>

        <TabsContent value="new" className="space-y-3">
          {requested.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">No new incoming requests.</Card>
          ) : (
            requested.map(renderJobCard)
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-3">
          {accepted.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">No accepted jobs awaiting dispatch.</Card>
          ) : (
            accepted.map(renderJobCard)
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-3">
          {completed.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">No completed jobs yet.</Card>
          ) : (
            completed.map(renderJobCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

