import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, School } from 'lucide-react';

export default async function OrganizationRequestsPage() {
  const session = await auth();
  const userRole = session?.user?.role;
  if (!session?.user || userRole !== 'FEDERATION_ADMIN') {
    redirect('/login');
  }

  const [societyRequests, institutionRequests] = await Promise.all([
    prisma.societyServiceRequest.findMany({
      where: { status: { in: ['OPEN', 'SCHEDULED', 'IN_PROGRESS'] } },
      include: {
        society: true,
        category: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.institutionServiceRequest.findMany({
      where: { status: { in: ['OPEN', 'SCHEDULED', 'IN_PROGRESS'] } },
      include: {
        institution: true,
        category: true,
        location: true,
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Organization Service Requests</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            Housing Society Requests
          </h2>
          {societyRequests.length === 0 ? (
            <p className="text-muted-foreground">No active housing society requests.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {societyRequests.map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-1">{req.category?.name || 'General'}</Badge>
                        <CardTitle className="text-base">{req.title}</CardTitle>
                      </div>
                      <Badge>{req.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{req.description}</p>
                    <div className="text-xs text-slate-500 flex flex-col gap-1 mb-4">
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Society: {req.society.name}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.location?.address || req.society.address}</span>
                    </div>
                    <Link href={`/admin/organization-requests/${req.id}/assign?type=SOCIETY`}>
                      <Button size="sm" className="w-full">Assign Worker</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 mt-8">
            <School className="w-5 h-5 text-teal-600" />
            Institution Requests
          </h2>
          {institutionRequests.length === 0 ? (
            <p className="text-muted-foreground">No active institution requests.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {institutionRequests.map(req => (
                <Card key={req.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <Badge variant="outline" className="mb-1">{req.category?.name || 'General'}</Badge>
                        <CardTitle className="text-base">{req.title}</CardTitle>
                      </div>
                      <Badge>{req.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{req.description}</p>
                    <div className="text-xs text-slate-500 flex flex-col gap-1 mb-4">
                      <span className="flex items-center gap-1"><School className="w-3.5 h-3.5" /> Institution: {req.institution.name}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {req.location?.address || req.institution.address}</span>
                    </div>
                    <Link href={`/admin/organization-requests/${req.id}/assign?type=INSTITUTION`}>
                      <Button size="sm" className="w-full">Assign Worker</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
