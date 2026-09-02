import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminWorkerActions } from './actions';

export default async function AdminWorkerDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!session?.user || (userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) redirect('/login');

  const resolvedParams = await Promise.resolve(params);
  const workerId = resolvedParams.id;

  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      user: true,
      cooperative: true,
      skills: { include: { skill: true } }
    }
  });

  if (!worker) return <div>Worker not found</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{worker.user.name}</h1>
          <p className="text-gray-500 text-sm">Worker Profile Details</p>
        </div>
        <Badge className="text-sm">
          {worker.verificationStatus}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Email</span>
              <p className="font-medium">{worker.user.email}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Phone</span>
              <p className="font-medium">{worker.user.phone || 'N/A'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Address</span>
              <p className="font-medium">{worker.address}, {worker.city}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Cooperative</span>
              <p className="font-medium">{worker.cooperative?.name || 'None'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Primary Trade</span>
              <p className="font-medium">{worker.primaryTrade || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Experience</span>
              <p className="font-medium">{worker.experience} years</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Verification Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminWorkerActions workerId={worker.id} currentStatus={worker.verificationStatus} />
        </CardContent>
      </Card>
    </div>
  );
}
