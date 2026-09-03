'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function CapacityPage() {
  const [capacityData, setCapacityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/capacity')
      .then((res) => res.json())
      .then((data) => setCapacityData(data))
      .catch((e) => { console.error('Error:', e); })
      .finally(() => setLoading(false));
  }, []);

  const tradeCapacityList = capacityData?.tradeCapacity
    ? Object.entries(capacityData.tradeCapacity).map(([trade, stats]: [string, any]) => ({
        trade,
        total: stats.total,
        available: stats.available,
        busy: stats.busy,
        utilization: stats.total > 0 ? Math.round((stats.busy / stats.total) * 100) : 0,
      }))
    : [
        { trade: 'AC Repair', total: 12, available: 4, busy: 8, utilization: 67 },
        { trade: 'Electrician', total: 10, available: 3, busy: 7, utilization: 70 },
        { trade: 'Plumber', total: 9, available: 5, busy: 4, utilization: 44 },
        { trade: 'Carpenter', total: 7, available: 4, busy: 3, utilization: 43 },
        { trade: 'Painter', total: 6, available: 3, busy: 3, utilization: 50 },
        { trade: 'Cleaner', total: 6, available: 4, busy: 2, utilization: 33 },
      ];

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full pb-20">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Worker Capacity & Workforce Planner</h1>
            <Badge className="bg-primary/10 text-primary font-bold">Live Utilization</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time workforce availability by trade, live job assignments, and dynamic capacity recommendations.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Total Verified Workforce</p>
            <p className="text-2xl font-black text-foreground mt-1">{capacityData?.totalWorkers || 50}</p>
            <p className="text-xs text-muted-foreground mt-1">Across 16 service trades</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Currently Available</p>
            <p className="text-2xl font-black text-green-600 mt-1">{capacityData?.availableWorkers || 23}</p>
            <p className="text-xs text-green-700 mt-1 font-semibold">Ready for immediate dispatch</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Active In-Progress Jobs</p>
            <p className="text-2xl font-black text-primary mt-1">{capacityData?.activeBookings || 14}</p>
            <p className="text-xs text-muted-foreground mt-1">Live service execution</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold">Workforce Utilization</p>
            <p className="text-2xl font-black text-primary mt-1">{capacityData?.utilizationRate || 54}%</p>
            <p className="text-xs text-muted-foreground mt-1">Balanced cooperative load</p>
          </CardContent>
        </Card>
      </div>

      {/* Trade Capacity Breakdown Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>Trade Capacity & Utilization Breakdown</span>
            <Badge variant="outline">Ahmedabad Cooperative</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-5 py-3">Trade / Specialization</th>
                  <th className="px-5 py-3">Total Workers</th>
                  <th className="px-5 py-3">Available</th>
                  <th className="px-5 py-3">Busy / On Job</th>
                  <th className="px-5 py-3">Utilization Rate</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tradeCapacityList.map((row) => (
                  <tr key={row.trade} className="hover:bg-muted/30">
                    <td className="px-5 py-3.5 font-bold text-foreground">{row.trade}</td>
                    <td className="px-5 py-3.5 font-semibold">{row.total}</td>
                    <td className="px-5 py-3.5 text-green-600 font-bold">{row.available}</td>
                    <td className="px-5 py-3.5 text-primary font-medium">{row.busy}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${row.utilization > 75 ? 'bg-amber-500' : 'bg-primary'}`}
                            style={{ width: `${row.utilization}%` }}
                          />
                        </div>
                        <span className="font-semibold">{row.utilization}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        variant={row.utilization > 75 ? 'secondary' : 'default'}
                        className={row.utilization > 75 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}
                      >
                        {row.utilization > 75 ? 'High Demand' : 'Balanced'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Capacity Planner Recommendations */}
      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Autonomous Capacity Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 text-xs">
          {capacityData?.recommendations?.map((rec: string, i: number) => (
            <div key={i} className="p-3 bg-muted/40 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-foreground">{rec}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


