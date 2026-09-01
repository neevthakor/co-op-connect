'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle2, XCircle, Clock, MapPin, Sparkles, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function HelpersPage() {
  const [data, setData] = useState<{ helperRequests: any[]; teams: any[] }>({
    helperRequests: [],
    teams: [],
  });
  const [nearbyHelpers, setNearbyHelpers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTeams = async () => {
    try {
      const [resTeams, resHelpers] = await Promise.all([
        fetch('/api/teams'),
        fetch('/api/matching/helpers?latitude=23.0225&longitude=72.5714'),
      ]);
      const teamsData = await resTeams.json();
      const helpersData = await resHelpers.json();

      setData({
        helperRequests: teamsData.helperRequests || [],
        teams: teamsData.teams || [],
      });
      setNearbyHelpers(Array.isArray(helpersData) ? helpersData : []);
    } catch (err: any) {
      toast.error('Failed to load helpers data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleAction = async (requestId: string, action: 'ACCEPT' | 'REJECT') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Failed to update helper request');

      toast.success(
        action === 'ACCEPT'
          ? 'Helper request accepted! Job team formed with 70% Lead / 30% Helper revenue split.'
          : 'Helper request rejected'
      );
      await fetchTeams();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-5xl mx-auto w-full">
      <header className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Helper System & Team Management</h1>
            <Badge className="bg-primary/10 text-primary font-bold">Flow 2: 70/30 Split</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Collaborate on complex repair jobs, split revenue equitably, and build trade mentorship.
          </p>
        </div>
      </header>

      {/* Revenue Split Model Banner */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black shrink-0">
              %
            </div>
            <div>
              <h4 className="font-bold text-sm text-foreground">Cooperative Multi-Worker Split Model</h4>
              <p className="text-muted-foreground mt-0.5">
                Lead Technician retains <strong>70%</strong> of labour charges + travel allowances. Assistant Helper receives <strong>30%</strong> guaranteed pay.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 font-mono font-bold bg-background px-3 py-1.5 rounded-md border">
            <span className="text-primary">70% Lead</span>
            <span>:</span>
            <span className="text-blue-600">30% Helper</span>
          </div>
        </CardContent>
      </Card>

      {/* Incoming / Pending Helper Requests */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-amber-500" /> Incoming Helper Invitations & Requests
        </h2>

        {data.helperRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-xs text-muted-foreground">
              No pending helper requests right now.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.helperRequests.map((req) => (
              <Card key={req.id} className="border shadow-xs">
                <CardContent className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm text-foreground">{req.booking?.category?.name || 'Service Job'}</p>
                      <p className="text-muted-foreground">Lead: {req.leadWorker?.user?.name || 'Technician'}</p>
                    </div>
                    <Badge variant={req.status === 'ACCEPTED' ? 'default' : req.status === 'PENDING' ? 'secondary' : 'destructive'}>
                      {req.status}
                    </Badge>
                  </div>

                  <div className="p-2.5 bg-muted/40 rounded flex justify-between items-center text-muted-foreground">
                    <span>Assigned Helper: <strong className="text-foreground">{req.helper?.user?.name || 'You'}</strong></span>
                    <span className="font-bold text-primary">30% Share</span>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-destructive hover:bg-destructive/10"
                        onClick={() => handleAction(req.id, 'REJECT')}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" /> Decline
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 font-bold"
                        onClick={() => handleAction(req.id, 'ACCEPT')}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Accept & Join Team
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Active Job Teams */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> Active Job Teams
        </h2>

        {data.teams.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-xs text-muted-foreground">
              No active multi-worker teams right now.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.teams.map((t) => (
              <Card key={t.id} className="border-primary/20 shadow-xs">
                <CardHeader className="p-4 pb-2 flex flex-row justify-between items-center">
                  <CardTitle className="text-sm font-bold">{t.booking?.category?.name || 'Team Job'} #{t.bookingId?.slice(0, 8)}</CardTitle>
                  <Badge variant="outline" className="text-primary font-bold">Active Team</Badge>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2 text-xs">
                  <div className="divide-y divide-border">
                    {t.members?.map((m: any) => (
                      <div key={m.id} className="py-2 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-semibold text-foreground">{m.worker?.user?.name || 'Team Member'}</p>
                            <p className="text-[10px] text-muted-foreground">{m.role}</p>
                          </div>
                        </div>
                        <span className="font-black text-primary text-sm">{m.revenueShare}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Discover Available Helpers */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Discover Available Helpers Nearby
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {nearbyHelpers.map((match) => {
            const h = match.helper || match;
            const u = h.user || {};
            return (
              <Card key={h.id} className="hover:border-primary/40 transition-all">
                <CardContent className="p-4 space-y-2 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                      {u.name?.[0] || 'H'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{u.name || 'Helper'}</p>
                      <p className="text-muted-foreground">{h.primaryTrade || 'Apprentice'} • {h.experience || 1} yr exp</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t flex justify-between text-muted-foreground">
                    <span>⭐ {h.averageRating || 4.8}</span>
                    <span>📍 {match.distanceKm || 1.2} km</span>
                    <span className="text-primary font-semibold">{match.matchScore || 90}% Match</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

