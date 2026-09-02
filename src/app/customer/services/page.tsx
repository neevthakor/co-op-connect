import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ServiceCard } from '@/components/shared/service-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface ServicesPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams?.q || '';

  const services = await prisma.serviceCategory.findMany({
    where: {
      name: {
        contains: query,
        mode: 'insensitive',
      },
      isActive: true,
    },
    orderBy: { sortOrder: 'asc' },
  });

  const regularServices = services.filter((s) => !s.isEmergency);
  const emergencyServices = services.filter((s) => s.isEmergency);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8 pb-24 lg:pb-10 max-w-7xl mx-auto w-full">
      <header>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-1 text-foreground">Our Cooperative Services</h1>
        <p className="text-muted-foreground text-sm">Find verified cooperative technicians and transparent fair-rate trades.</p>
      </header>

      <form className="relative w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input 
          name="q" 
          defaultValue={query} 
          placeholder="Search services (e.g. AC Repair, Plumbing, Electrician)..." 
          className="pl-10 h-12 rounded-xl w-full bg-card border-border/80 text-foreground placeholder:text-muted-foreground text-sm shadow-xs" 
        />
      </form>

      {services.length === 0 ? (
        <EmptyState title="No services found" description="Try a different search term or browse all services." />
      ) : (
        <div className="flex flex-col gap-8">
          {emergencyServices.length > 0 && (
            <section>
              <h2 className="text-lg md:text-xl font-bold mb-4 text-destructive flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
                Emergency Services
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {emergencyServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </section>
          )}

          {regularServices.length > 0 && (
            <section>
              <h2 className="text-lg md:text-xl font-bold mb-4 text-foreground">Standard Trade Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
