import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminWorkerActions } from './actions';
import { SkillAssessmentActions } from './skill-actions';

export default async function AdminWorkerDetailsPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await auth();
  const userRole = session?.user?.role;
  if (!session?.user || (userRole !== 'ADMIN' && userRole !== 'COOPERATIVE_ADMIN' && userRole !== 'FEDERATION_ADMIN')) redirect('/login');

  const resolvedParams = await params;
  const workerId = resolvedParams?.id;

  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      user: true,
      cooperative: true,
      skills: { include: { skill: true } }
    }
  });

  if (!worker) return <div>Worker not found</div>;

  if (userRole === 'COOPERATIVE_ADMIN' && worker.cooperativeId !== session.user.cooperativeId) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          Forbidden: This worker belongs to a different cooperative.
        </div>
      </div>
    );
  }

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
          <CardTitle>Trade Skills & Verification</CardTitle>
          <CardDescription>Review the worker's declared skills and their current assessment status.</CardDescription>
        </CardHeader>
        <CardContent>
          {worker.skills.length === 0 ? (
            <p className="text-gray-500 text-sm">No skills listed.</p>
          ) : (
            <div className="grid gap-3">
              {worker.skills.map((ws) => (
                <div key={ws.id} className="flex flex-col sm:flex-row justify-between p-3 bg-gray-50 border rounded-lg">
                  <div>
                    <h4 className="font-bold text-gray-900">{ws.skill.name}</h4>
                    <p className="text-sm text-gray-600">
                      Level: {ws.proficiencyLevel} {ws.experienceYears ? `| Exp: ${ws.experienceYears} yrs` : ''}
                    </p>
                    {ws.experienceDescription && (
                      <p className="text-xs text-gray-500 mt-1 italic">"{ws.experienceDescription}"</p>
                    )}
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end gap-2">
                    <Badge variant="outline" className={
                      ws.skillVerificationStatus === 'SKILL_ASSESSED' ? 'bg-green-100 text-green-800 border-green-200' :
                      ws.skillVerificationStatus === 'ASSESSMENT_PENDING' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      ws.skillVerificationStatus === 'REJECTED' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }>
                      {ws.skillVerificationStatus?.replace('_', ' ') || 'SELF DECLARED'}
                    </Badge>
                    <SkillAssessmentActions workerId={worker.id} skillId={ws.id} currentStatus={ws.skillVerificationStatus} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
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
