'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeartHandshake, ShieldCheck, AlertTriangle, Activity, UserCheck, Stethoscope } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function WelfarePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/welfare')
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const metrics = data?.metrics || {
    totalWorkers: 50,
    insuredWorkers: 43,
    insuranceCoveragePercent: 86,
    trainedWorkers: 38,
    trainingCoveragePercent: 76,
    highWorkloadAlerts: 4,
  };

  const welfareRecords = data?.welfareRecords || [
    {
      id: '1',
      date: new Date(),
      type: 'HEALTH_CHECKUP',
      description: 'Annual occupational health screening completed for AC and Electrical technicians.',
      status: 'RESOLVED',
      worker: { user: { name: 'Ramesh Patel', phone: '+91 98765 43210' } },
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      type: 'OVERWORK_ALERT',
      description: 'Logged over 52 working hours in past 6 days. Mandatory rest day recommendation issued.',
      status: 'OPEN',
      worker: { user: { name: 'Priya Sharma', phone: '+91 98765 43211' } },
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full pb-20">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Worker Welfare & Occupational Health Monitor</h1>
          <Badge className="bg-primary/10 text-primary font-bold">Social Security Engine</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Autonomous safety monitoring, insurance coverage tracking, and workload fatigue alerts for cooperative workers.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Total Supported Workers</p>
            <p className="text-2xl font-black text-foreground mt-1">{metrics.totalWorkers}</p>
            <p className="text-xs text-muted-foreground mt-1">Cooperative Members</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Accident & Health Insurance</p>
            <p className="text-2xl font-black text-green-600 mt-1">{metrics.insuranceCoveragePercent}%</p>
            <p className="text-xs text-green-700 mt-1 font-semibold">{metrics.insuredWorkers} Active Covered Workers</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Safety Certification</p>
            <p className="text-2xl font-black text-primary mt-1">{metrics.trainingCoveragePercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">{metrics.trainedWorkers} Certified Technicians</p>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Fatigue & Workload Alerts</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{metrics.highWorkloadAlerts}</p>
            <p className="text-xs text-amber-700 mt-1 font-semibold">Requires Schedule Rest</p>
          </CardContent>
        </Card>
      </div>

      {/* Welfare Record & Health Alert Stream */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>Live Worker Welfare Interventions & Activity Feed</span>
            <Badge variant="outline">2% Welfare Fund Allocation</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-4 pt-0 text-xs">
          {welfareRecords.map((r: any) => (
            <div
              key={r.id}
              className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                r.status === 'OPEN' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-muted/30 border-border'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground">{r.worker?.user?.name || 'Worker Member'}</span>
                  <Badge variant={r.status === 'OPEN' ? 'secondary' : 'default'} className="text-[10px]">
                    {r.type || 'INTERVENTION'}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{r.description}</p>
              </div>

              <div className="text-right shrink-0 text-muted-foreground text-[11px]">
                <p>{formatDate(new Date(r.date))}</p>
                <Badge
                  variant="outline"
                  className={r.status === 'OPEN' ? 'text-amber-700 border-amber-300 mt-1' : 'text-green-700 border-green-300 mt-1'}
                >
                  {r.status === 'OPEN' ? 'Needs Attention' : 'Resolved'}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

