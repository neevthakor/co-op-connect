import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { matchWorkers } from '@/services/matching';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, CheckCircle2, ShieldCheck, Clock, Award } from 'lucide-react';

export default async function AssignWorkerPage({ params, searchParams }: { params: { id: string }, searchParams: { type?: string } }) {
  const session = await auth();
  const userRole = (session?.user as any)?.role;
  if (!session?.user || userRole !== 'FEDERATION_ADMIN') {
    redirect('/login');
  }

  const { id } = params;
  const type = searchParams.type as "SOCIETY" | "INSTITUTION";

  if (type !== 'SOCIETY' && type !== 'INSTITUTION') {
    return <div>Invalid type</div>;
  }

  let requestData: any = null;
  if (type === 'SOCIETY') {
    requestData = await prisma.societyServiceRequest.findUnique({
      where: { id },
      include: { society: true, category: true, location: true }
    });
  } else {
    requestData = await prisma.institutionServiceRequest.findUnique({
      where: { id },
      include: { institution: true, category: true, location: true }
    });
  }

  if (!requestData) {
    return <div>Request not found</div>;
  }

  const lat = requestData.location?.latitude || (type === 'SOCIETY' ? requestData.society?.latitude : requestData.institution?.latitude);
  const lng = requestData.location?.longitude || (type === 'SOCIETY' ? requestData.society?.longitude : requestData.institution?.longitude);

  let matchResults: any[] = [];
  if (lat && lng && requestData.categoryId) {
    matchResults = await matchWorkers({
      categoryId: requestData.categoryId,
      latitude: lat,
      longitude: lng,
      urgency: requestData.priority === 'URGENT' ? 'URGENT' : 'NORMAL'
    });
  } else {
    // Fallback if no lat/lng - just get verified workers
    const workers = await prisma.worker.findMany({
      where: { verificationStatus: 'VERIFIED', availabilityStatus: 'AVAILABLE' },
      include: { user: true, cooperative: true },
      take: 10
    });
    matchResults = workers.map(w => ({
      worker: w,
      match_score: 50,
      score_breakdown: { skill: 0, availability: 0, distance: 0, reliability: 0, certification: 0, fairness: 0 },
      explanation: 'Matched purely on availability (no location provided).'
    }));
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assign Worker</h1>

      <Card className="mb-8">
        <CardHeader className="bg-slate-50 border-b pb-4">
          <Badge variant="outline" className="mb-2 w-fit">{type} REQUEST</Badge>
          <CardTitle>{requestData.title}</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">{requestData.description}</p>
        </CardHeader>
        <CardContent className="pt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-slate-500">Organization:</span>
            <p>{type === 'SOCIETY' ? requestData.society.name : requestData.institution.name}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Location:</span>
            <p className="flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {requestData.location?.address || (type === 'SOCIETY' ? requestData.society.address : requestData.institution.address)}
            </p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Service Category:</span>
            <p>{requestData.category?.name || 'Unspecified'}</p>
          </div>
          <div>
            <span className="font-semibold text-slate-500">Priority:</span>
            <Badge className={requestData.priority === 'URGENT' ? 'bg-red-100 text-red-800' : ''}>{requestData.priority}</Badge>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-lg font-bold mb-4">FairMatch Recommended Workers</h2>
      {matchResults.length === 0 ? (
        <p className="text-muted-foreground">No available workers found for this criteria.</p>
      ) : (
        <div className="space-y-4">
          {matchResults.map((m, idx) => (
            <Card key={m.worker.id} className={idx === 0 ? 'border-primary shadow-md' : ''}>
              <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{m.worker.user?.name || 'Worker'}</h3>
                    {m.worker.verificationStatus === 'VERIFIED' && <ShieldCheck className="w-4 h-4 text-green-600" />}
                    {idx === 0 && <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Top Match</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <span>{m.worker.primaryTrade}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{m.worker.cooperative?.name || 'Cooperative'}</span>
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-xs mb-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-green-500" /> Score: {Math.round(m.match_score)}%
                    </span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {m.worker.availabilityStatus}
                    </span>
                    {m.worker.averageRating > 0 && (
                      <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-500" /> {m.worker.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 italic">"{m.explanation}"</p>
                </div>
                
                <form action="/api/admin/organization/assign" method="POST" className="shrink-0 w-full sm:w-auto">
                  <input type="hidden" name="requestId" value={requestData.id} />
                  <input type="hidden" name="type" value={type} />
                  <input type="hidden" name="workerId" value={m.worker.id} />
                  <Button type="submit" className="w-full sm:w-auto">Assign & Dispatch</Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
