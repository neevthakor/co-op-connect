import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { getWorkerProfile } from '@/services/worker-profile';
import { TrustPassport } from '@/components/shared/trust-passport';
import { TrustedWorkerButton } from '@/components/customer/trusted-worker-button';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function CustomerWorkerProfilePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const workerId = resolvedParams.id;
  const customerId = session.user.customerId;

  const profileData = await getWorkerProfile(workerId);

  if (!profileData) notFound();

  const { worker } = profileData;

  // Check if trusted
  let isTrusted = false;
  if (customerId) {
    const trusted = await prisma.trustedWorker.findUnique({
      where: {
        customerId_workerId: {
          customerId,
          workerId
        }
      }
    });
    isTrusted = !!trusted;
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-3xl mx-auto w-full">
      <header className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{worker.user?.name}'s Profile</h1>
          <p className="text-muted-foreground">
            {worker.primaryTrade || 'Technician'} • Member of {worker.cooperative?.name || 'Cooperative'}
          </p>
        </div>
        <div className="flex gap-2">
          <TrustedWorkerButton workerId={worker.id} initialIsTrusted={isTrusted} />
          <Link href={`/customer/book?workerId=${worker.id}`}>
            <Button>Book Worker</Button>
          </Link>
        </div>
      </header>

      <TrustPassport profileData={profileData} />

      <div className="flex flex-col sm:hidden gap-3 mt-4">
        <Link href={`/customer/book?workerId=${worker.id}`} className="w-full">
          <Button className="w-full">Book Worker</Button>
        </Link>
      </div>
    </div>
  );
}
