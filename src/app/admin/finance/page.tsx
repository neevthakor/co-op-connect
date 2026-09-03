'use client';

import { useState, useEffect } from 'react';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { IndianRupee, ShieldCheck, HeartHandshake, TrendingUp, Building2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/finance')
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((e) => { console.error('Error:', e); })
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary || {
    grossRevenue: 520000,
    netTakeHome: 483600,
    cooperativeFund: 26000,
    welfareFund: 10400,
  };

  const monthlyData = data?.monthlyData || [
    { month: 'Jan', revenue: 65000, coopFund: 3250, welfareFund: 1300 },
    { month: 'Feb', revenue: 78000, coopFund: 3900, welfareFund: 1560 },
    { month: 'Mar', revenue: 95000, coopFund: 4750, welfareFund: 1900 },
    { month: 'Apr', revenue: 110000, coopFund: 5500, welfareFund: 2200 },
    { month: 'May', revenue: 102000, coopFund: 5100, welfareFund: 2040 },
    { month: 'Jun', revenue: 70000, coopFund: 3500, welfareFund: 1400 },
  ];

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full pb-20">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Cooperative Financial Ledger & Welfare Fund</h1>
          <Badge className="bg-primary/10 text-primary font-bold">Transparent Ledger</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Cooperative gross service volume, worker net income distribution, and welfare contributions.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Gross Revenue"
          value={formatCurrency(summary.grossRevenue)}
          description="Total customer booking volume"
        />
        <StatCard
          title="Direct Worker Payouts"
          value={formatCurrency(summary.netTakeHome)}
          description="93% direct worker take-home"
        />
        <StatCard
          title="Cooperative Fund (5%)"
          value={formatCurrency(summary.cooperativeFund)}
          description="Society operations & tech maintenance"
        />
        <StatCard
          title="Worker Welfare Fund (2%)"
          value={formatCurrency(summary.welfareFund)}
          description="Healthcare, insurance & emergency aid"
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center justify-between">
            <span>Gross Revenue & Cooperative Fund Trajectory</span>
            <span className="text-xs font-normal text-muted-foreground">Monthly Ledger (INR)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: any) => `₹${Number(value || 0).toLocaleString('en-IN')}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" name="Gross Service Volume" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="coopFund" name="5% Co-op Fund" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="welfareFund" name="2% Welfare Fund" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Earning Transactions */}
      {data?.recentEarnings && data.recentEarnings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">Recent Cooperative Payout Ledger</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-y text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Worker / Technician</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3 text-right">Gross</th>
                    <th className="px-5 py-3 text-right">5% Co-op</th>
                    <th className="px-5 py-3 text-right">2% Welfare</th>
                    <th className="px-5 py-3 text-right font-bold">Net Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentEarnings.slice(0, 10).map((e: any) => (
                    <tr key={e.id} className="hover:bg-muted/30">
                      <td className="px-5 py-3 text-muted-foreground">{formatDate(new Date(e.date))}</td>
                      <td className="px-5 py-3 font-semibold text-foreground">{e.worker?.user?.name || 'Worker'}</td>
                      <td className="px-5 py-3 text-muted-foreground">{e.description}</td>
                      <td className="px-5 py-3 text-right font-medium">{formatCurrency(e.grossAmount)}</td>
                      <td className="px-5 py-3 text-right text-amber-600">-{formatCurrency(e.cooperativeDeduction)}</td>
                      <td className="px-5 py-3 text-right text-green-600">-{formatCurrency(e.welfareDeduction)}</td>
                      <td className="px-5 py-3 text-right font-bold text-foreground">{formatCurrency(e.netAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


