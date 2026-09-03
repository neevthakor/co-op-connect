import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { WorkerCard } from '@/components/shared/worker-card';
import { EmptyState } from '@/components/shared/empty-state';

export default async function TrustedWorkersPage() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const customerId = (session.user as any).customerId;

  const trusted = customerId
    ? await prisma.trustedWorker.findMany({
        where: { customerId },
        include: {
          worker: {
            include: {
              user: true,
              cooperative: true,
            },
          },
        },
      })
    : [];

  const workers = trusted.map((tw) => tw.worker);

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-7xl mx-auto w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Trusted Workers</h1>
        <p className="text-muted-foreground">Workers you have saved for future services.</p>
      </header>

      {workers.length === 0 ? (
        <EmptyState 
          title="No trusted workers yet" 
          description="When you find a worker you like, add them to your trusted list to book them again easily." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} showTrustedButton={true} initialIsTrusted={true} />
          ))}
        </div>
      )}
    </div>
  );
}
