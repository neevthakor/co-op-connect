import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { TrustPassport } from '@/components/shared/trust-passport';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function WorkerProfilePage({ params }: { params: { id: string } }) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const worker = await prisma.worker.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      cooperative: true
    }
  });

  if (!worker) notFound();

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-3xl mx-auto w-full">
      <header className="flex justify-between items-start mb-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">{worker.user.name}'s Profile</h1>
          <p className="text-muted-foreground">Verified Cooperative Worker</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="hidden sm:flex">Add to Trusted</Button>
          <Link href={`/customer/book?workerId=${worker.id}`}>
            <Button>Book Worker</Button>
          </Link>
        </div>
      </header>

      <TrustPassport worker={worker} />

      <div className="flex flex-col sm:hidden gap-3 mt-4">
        <Button variant="outline" className="w-full">Add to Trusted</Button>
        <Link href={`/customer/book?workerId=${worker.id}`} className="w-full">
          <Button className="w-full">Book Worker</Button>
        </Link>
      </div>
    </div>
  );
}
