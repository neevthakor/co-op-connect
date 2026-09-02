import { auth } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { getWorkerProfile } from '@/services/worker-profile';
import { TrustPassport } from '@/components/shared/trust-passport';
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

  const resolvedParams = await Promise.resolve(params);
  const workerId = resolvedParams.id;

  const profileData = await getWorkerProfile(workerId);

  if (!profileData) notFound();

  const { worker } = profileData;

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-3xl mx-auto w-full">
      <header className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{worker.user.name}'s Profile</h1>
          <p className="text-muted-foreground">
            {worker.primaryTrade || 'Technician'} • Member of {worker.cooperative?.name || 'Cooperative'}
          </p>
        </div>
        <div className="flex gap-2">
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
