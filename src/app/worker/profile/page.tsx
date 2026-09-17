import { auth, signOut } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getWorkerProfile } from '@/services/worker-profile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Wrench, LogOut, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  const workerId = session.user.workerId;

  if (!workerId) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Worker profile not found for this account.
      </div>
    );
  }

  const profileData = await getWorkerProfile(workerId);

  if (!profileData) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Worker profile not found.
      </div>
    );
  }

  const {
    worker,
    completedJobsCount,
    averageRating,
    totalRatingsCount,
    punctualityScore,
    skills,
    certifications,
    recentReviews,
    earningsSummary,
  } = profileData;

  const isVerified = worker.verificationStatus === 'VERIFIED';

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-4xl mx-auto w-full">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{worker.user?.name}</h1>
            <Badge
              className={
                isVerified
                  ? 'bg-green-100 text-green-800'
                  : 'bg-amber-100 text-amber-800'
              }
            >
              {worker.verificationStatus}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {worker.primaryTrade || 'Technician'} • Member of{' '}
            {worker.cooperative?.name || 'Cooperative'}
          </p>
        </div>
      </header>

      {/* Overview Stats from Real Database Aggregations */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Average Rating</p>
            <p className="text-2xl font-black text-amber-500 mt-1 flex items-center justify-center gap-1">
              {averageRating !== null ? (
                <>⭐ {averageRating}</>
              ) : (
                <span className="text-sm font-normal text-muted-foreground">No ratings yet</span>
              )}
            </p>
            {totalRatingsCount > 0 && (
              <p className="text-[10px] text-muted-foreground mt-0.5">{totalRatingsCount} review{totalRatingsCount > 1 ? 's' : ''}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Completed Jobs</p>
            <p className="text-2xl font-black text-primary mt-1">{completedJobsCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Punctuality Score</p>
            <p className="text-2xl font-black text-green-600 mt-1">
              {punctualityScore !== null ? (
                `${punctualityScore}%`
              ) : (
                <span className="text-xs font-normal text-muted-foreground">Not enough data</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground font-semibold">Availability</p>
            <Badge
              className="mt-2"
              variant={worker.availabilityStatus === 'AVAILABLE' ? 'default' : 'secondary'}
            >
              {(worker.availabilityStatus as string)}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Earnings Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Gross Revenue:</span>
              <p className="text-sm font-bold text-foreground mt-0.5">{formatCurrency(earningsSummary.grossTotal)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">5% Co-op Fund:</span>
              <p className="text-sm font-bold text-amber-700 mt-0.5">{formatCurrency(earningsSummary.cooperativeTotal)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">2% Welfare Fund:</span>
              <p className="text-sm font-bold text-blue-700 mt-0.5">{formatCurrency(earningsSummary.welfareTotal)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Net Take-Home:</span>
              <p className="text-sm font-bold text-green-600 mt-0.5">{formatCurrency(earningsSummary.netTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="h-4 w-4 text-primary" /> Trade Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {skills.length === 0 ? (
              <p className="text-xs text-muted-foreground">No skills added yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {skills.map((ws) => {
                  const statusColors: Record<string, string> = {
                    'SELF_DECLARED': 'text-gray-600 bg-gray-50 border-gray-200',
                    'ASSESSMENT_PENDING': 'text-amber-600 bg-amber-50 border-amber-200',
                    'SKILL_ASSESSED': 'text-green-700 bg-green-50 border-green-200',
                    'REJECTED': 'text-red-700 bg-red-50 border-red-200',
                  };
                  const color = ws.skillVerificationStatus ? statusColors[ws.skillVerificationStatus] : statusColors['SELF_DECLARED'];
                  const statusLabel = ws.skillVerificationStatus ? ws.skillVerificationStatus.replace('_', ' ') : 'SELF DECLARED';

                  return (
                    <div key={ws.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs p-2 bg-muted/40 rounded border">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-sm">{ws.skill.name}</span>
                        <span className="text-muted-foreground">
                          {ws.proficiencyLevel} {ws.experienceYears ? `• ${ws.experienceYears} yrs experience` : ''}
                        </span>
                      </div>
                      <Badge variant="outline" className={`mt-2 sm:mt-0 ${color}`}>
                        {ws.skillVerificationStatus === 'SKILL_ASSESSED' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                        {statusLabel}
                      </Badge>
                    </div>
                  );
                })}
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
            {certifications.length === 0 ? (
              <p className="text-xs text-muted-foreground">No certifications added</p>
            ) : (
              certifications.map((c) => (
                <div key={(c.id as string)} className="flex justify-between items-center text-xs p-2 bg-muted/40 rounded">
                  <span className="font-semibold">{(c.certification as { name: string }).name}</span>
                  <Badge variant="outline" className={c.verified ? 'text-green-700' : 'text-muted-foreground'}>
                    {c.verified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reviews */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          Recent Customer Reviews ({recentReviews.length})
        </h2>
        {recentReviews.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-xs text-muted-foreground">
              No customer reviews submitted yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((r) => {
              const dateStr = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              }) : '';

              return (
                <Card key={r.id}>
                  <CardContent className="p-4 space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {r.customer?.name || 'Customer'}
                        </span>
                        {r.serviceCategory && (
                          <span className="text-muted-foreground">
                            ({r.serviceCategory})
                          </span>
                        )}
                      </div>
                      <span className="text-amber-500 font-bold">{r.rating.toFixed(1)} ★</span>
                    </div>
                    <p className="text-foreground mt-1">
                      {r.comment ? r.comment : <span className="italic text-muted-foreground">No written review</span>}
                    </p>
                    <div className="flex justify-between items-center pt-1 border-t border-muted/50 text-[10px] text-muted-foreground">
                      <div className="flex gap-4">
                        <span>Quality: {r.technicalQuality}/5</span>
                        <span>Punctuality: {r.punctuality}/5</span>
                        <span>Transparency: {r.priceTransparency}/5</span>
                      </div>
                      {dateStr && <span>{dateStr}</span>}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <form
        action={async () => {
          'use server';
          await signOut({ redirectTo: '/login' });
        }}
      >
        <Button variant="destructive" className="w-full gap-2" type="submit">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </form>
    </div>
  );
}
