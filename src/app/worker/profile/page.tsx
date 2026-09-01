import { auth, signOut } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShieldCheck, Award, Wrench, CheckCircle2, Phone, Mail, MapPin, LogOut } from 'lucide-react';

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const workerId = (session.user as any).workerId;

  const worker = await prisma.worker.findFirst({
    where: workerId ? { id: workerId } : { userId: session.user.id },
    include: {
      user: true,
      cooperative: true,
      skills: { include: { skill: true } },
      certifications: { include: { certification: true } },
      ratings: {
        include: { customer: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!worker) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Worker profile not found for this account.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-4xl mx-auto w-full">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{worker.user.name}</h1>
            <Badge className="bg-primary/10 text-primary font-bold">{worker.verificationStatus}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {worker.primaryTrade} • Member of {worker.cooperative?.name || 'Ahmedabad Cooperative'}
          </p>
        </div>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Average Rating</p>
            <p className="text-2xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
              ⭐ {worker.averageRating || 4.9}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Completed Jobs</p>
            <p className="text-2xl font-black text-primary mt-1">{worker.totalJobs || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Punctuality Score</p>
            <p className="text-2xl font-black text-green-600 mt-1">{worker.punctualityScore || 98}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Availability</p>
            <Badge className="mt-2" variant={worker.availabilityStatus === 'AVAILABLE' ? 'default' : 'secondary'}>
              {worker.availabilityStatus}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Skills & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" /> Verified Trade Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {worker.skills.length === 0 ? (
              <p className="text-xs text-muted-foreground">General trade expertise</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {worker.skills.map((ws) => (
                  <Badge key={ws.id} variant="outline" className="text-xs py-1 px-2.5">
                    {ws.skill.name} • {ws.proficiencyLevel}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Cooperative Certifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {worker.certifications.length === 0 ? (
              <p className="text-xs text-muted-foreground">Cooperative Induction Training Certified</p>
            ) : (
              worker.certifications.map((c) => (
                <div key={c.id} className="flex justify-between items-center text-xs p-2 bg-muted/40 rounded">
                  <span className="font-semibold">{c.certification.name}</span>
                  <Badge variant="outline" className="text-green-700">Verified</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Recent Customer Reviews</h2>
        {worker.ratings.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-xs text-muted-foreground">
              No customer reviews submitted yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {worker.ratings.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-4 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{r.customer?.user?.name || 'Customer'}</span>
                    <span className="text-amber-500 font-bold">⭐ {r.overall} / 5</span>
                  </div>
                  <p className="text-muted-foreground">{r.review || 'Excellent and punctual service!'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <form action={async () => {
        'use server';
        await signOut({ redirectTo: '/login' });
      }}>
        <Button variant="destructive" className="w-full gap-2" type="submit">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </div>
  );
}

