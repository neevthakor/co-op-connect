import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ServiceCard } from '@/components/shared/service-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default async function ServicesPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const query = searchParams.q || '';

  const services = await prisma.serviceCategory.findMany({
    where: {
      name: {
        contains: query,
      },
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  const regularServices = services.filter((s) => !s.isEmergency);
  const emergencyServices = services.filter((s) => s.isEmergency);

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-7xl mx-auto w-full">
      <header>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Our Services</h1>
        <p className="text-muted-foreground">Find the right verified cooperative help for your needs.</p>
      </header>

      <form className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          name="q" 
          defaultValue={query} 
          placeholder="Search services..." 
          className="pl-9 h-12 rounded-xl w-full" 
        />
      </form>

      {services.length === 0 ? (
        <EmptyState title="No services found" description="Try a different search term." />
      ) : (
        <div className="flex flex-col gap-8">
          {emergencyServices.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-red-600">Emergency Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {emergencyServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          )}

          {regularServices.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Standard Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {regularServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
