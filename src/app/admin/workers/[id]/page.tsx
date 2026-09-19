import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarWithAuth } from '@/components/shared/avatar-with-auth';
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
      skills: { include: { skill: true } },
      verificationResponses: { include: { question: true } }
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
        <div className="flex items-center gap-4">
          <AvatarWithAuth 
            src={worker.user.avatar} 
            alt={worker.user.name} 
            fallback={worker.user.name.charAt(0)}
            workerId={worker.id}
            className="w-16 h-16 border border-border"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{worker.user.name}</h1>
            <p className="text-gray-500 text-sm">Worker Profile Details</p>
          </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Primary Trade</span>
                <p className="font-medium">{worker.primaryTrade || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider">Experience</span>
                <p className="font-medium">{worker.experience} years</p>
              </div>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider">Service Area</span>
              <p className="font-medium">{worker.city}, {worker.state}</p>
              {worker.latitude && worker.longitude && (
                <p className="text-xs text-green-600 font-medium mt-0.5">✓ GPS Coordinates Available</p>
              )}
            </div>

            <div className="border-t pt-3 mt-3">
              <h4 className="text-sm font-semibold mb-2">Skill Learning Information</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">How Skill Was Learned</span>
                  <p className="font-medium text-sm">{worker.learningMethod || 'Not provided'}</p>
                </div>
                {worker.trainingInstitute && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Training Institute</span>
                    <p className="font-medium text-sm">{worker.trainingInstitute}</p>
                  </div>
                )}
                {worker.learningDetails && (
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Additional Details</span>
                    <p className="font-medium text-sm">{worker.learningDetails}</p>
                  </div>
                )}
              </div>
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
                      Level: {ws.proficiencyLevel} 
                    </p>
                    
                  </div>
                  <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end gap-2">
                    <Badge variant="outline" className={
                      ws.verified ? 'bg-green-100 text-green-800 border-green-200' :
                      !ws.verified ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      !ws.verified ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }>
                      {ws.verified ? "VERIFIED" : "PENDING"?.replace('_', ' ') || 'SELF DECLARED'}
                    </Badge>
                    <SkillAssessmentActions workerId={worker.id} skillId={ws.id} currentStatus={ws.verified ? "VERIFIED" : "PENDING"} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {worker.verificationResponses && worker.verificationResponses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Skill Verification Answers</CardTitle>
            <CardDescription>Review the worker's answers to trade-specific questions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {worker.verificationResponses.map((vr, idx) => (
                <div key={vr.id} className="bg-gray-50 p-4 rounded-lg border">
                  <p className="font-medium text-sm text-gray-900 mb-2">Q{idx + 1}: {vr.questionSnapshot}</p>
                  <div className="pl-4 border-l-2 border-primary/40">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{vr.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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
