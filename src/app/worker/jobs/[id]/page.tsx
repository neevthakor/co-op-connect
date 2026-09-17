import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { JobExecutionClient } from '@/components/worker/job-execution-client';

export default async function JobExecutionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.workerId) {
    redirect('/login');
  }

  const resolvedParams = await params;

  const job = await prisma.booking.findUnique({
    where: { id: resolvedParams.id },
    include: {
      customer: { include: { user: true } },
      category: true,
      jobProofs: true,
      materialRequests: true,
      invoice: true,
      team: { include: { members: { include: { worker: { include: { user: true } } } } } },
    }
  });

  if (!job) {
    notFound();
  }

  // IDOR Protection: Verify this worker is assigned OR it's a team member OR it's REQUESTED
  let isAuthorized = false;

  if (job.workerId === session.user.workerId) {
    isAuthorized = true;
  } else if (job.status === 'REQUESTED') {
    // If it's requested, any worker could potentially accept it if it's available to them.
    // In a real system, you might verify it's assigned to their cooperative, but for now allow it.
    isAuthorized = true;
  } else if (job.team) {
    // Check if worker is a team member
    const isMember = job.team.members.some((m) => m.workerId === session.user.workerId);
    if (isMember) isAuthorized = true;
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="bg-red-50 text-red-700 p-6 rounded-xl shadow-sm text-center max-w-md">
          <h2 className="text-lg font-bold mb-2">Access Denied</h2>
          <p>You do not have permission to view or manage this job. It may be assigned to another worker.</p>
        </div>
      </div>
    );
  }

  // Create a plain object for the client component since Prisma dates cannot be passed directly sometimes without serialization warnings
  const safeJob = JSON.parse(JSON.stringify(job));

  return (
    <JobExecutionClient initialJob={safeJob} />
  );
}
