'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck, User, Wrench, RefreshCw, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function VerificationPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchWorkers = async (status: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/verification?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      toast.error('Error fetching verification queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers(statusFilter);
  }, [statusFilter]);

  const handleAction = async (id: string, action: 'APPROVE' | 'REJECT' | 'SUSPEND') => {
    setActionLoading(id);
    try {
      const res = await fetch('/api/admin/verification', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');

      toast.success(`Worker application ${action.toLowerCase()}d successfully`);
      await fetchWorkers(statusFilter);
    } catch (error: any) {
      toast.error(error.message || `Error performing action ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Worker Verification & KYC Queue</h1>
            <Badge className="bg-primary/10 text-primary font-bold">Admin Audit</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review background credentials, trade certifications, and approve new cooperative members.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex bg-muted p-1 rounded-lg text-xs font-semibold">
          {['PENDING', 'VERIFIED', 'SUSPENDED', 'ALL'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                statusFilter === s ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3">Worker Candidate</th>
                  <th className="px-5 py-3">Trade & Skills</th>
                  <th className="px-5 py-3">Experience</th>
                  <th className="px-5 py-3">Cooperative</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">KYC Review Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[400px]">
                        <Clock className="w-8 h-8 animate-spin mb-2 opacity-50" />
                        Loading verification queue...
                      </div>
                    </td>
                  </tr>
                ) : workers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No workers found for status: {statusFilter}
                    </td>
                  </tr>
                ) : (
                  workers.map((w) => (
                    <tr key={w.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                            {w.user?.name?.[0] || 'W'}
                          </div>
                          <div>
                            <p className="font-bold text-foreground text-sm">{w.user?.name || 'Worker'}</p>
                            <p className="text-[11px] text-muted-foreground">{w.user?.phone || w.user?.email || '+91 98765 43210'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-foreground">{w.primaryTrade || 'Technician'}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {w.skills?.slice(0, 2).map((ws: any) => (
                            <span key={ws.id} className="bg-secondary px-1.5 py-0.5 rounded text-[10px]">
                              {ws.skill?.name || 'Skill'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium">{w.experience || 2} Years</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{w.cooperative?.name || 'Ahmedabad Cooperative'}</td>
                      <td className="px-5 py-3.5">
                        <Badge
                          className={
                            w.verificationStatus === 'VERIFIED'
                              ? 'bg-green-100 text-green-800'
                              : w.verificationStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {w.verificationStatus}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          {w.verificationStatus === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 text-xs bg-green-600 hover:bg-green-700 text-white font-semibold"
                                onClick={() => handleAction(w.id, 'APPROVE')}
                                disabled={actionLoading === w.id}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 text-xs font-semibold"
                                onClick={() => handleAction(w.id, 'REJECT')}
                                disabled={actionLoading === w.id}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                          {w.verificationStatus === 'VERIFIED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs text-destructive hover:bg-destructive/10"
                              onClick={() => handleAction(w.id, 'SUSPEND')}
                              disabled={actionLoading === w.id}
                            >
                              Suspend
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

