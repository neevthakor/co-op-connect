'use client'
import { StatCard } from '@/components/shared/stat-card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts'

const allocationData = [
  { worker: 'Ramesh', jobs: 12 },
  { worker: 'Suresh', jobs: 10 },
  { worker: 'Kamlesh', jobs: 15 },
  { worker: 'Naresh', jobs: 11 },
  { worker: 'Dinesh', jobs: 9 },
]

const incomeData = [
  { decile: '10%', share: 2 },
  { decile: '20%', share: 5 },
  { decile: '30%', share: 10 },
  { decile: '40%', share: 18 },
  { decile: '50%', share: 28 },
]

export default function FairMatchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Fairness Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Fairness Score" value="92%" description="Cooperative Avg: 85%" />
        <StatCard title="Avg Jobs / Worker" value="12" description="This Month" />
        <StatCard title="Income Gini Coefficient" value="0.21" description="Low Inequality" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-xl bg-card">
          <h2 className="text-xl font-semibold mb-6">Job Allocation Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={allocationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="worker" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="jobs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-6 border rounded-xl bg-card">
          <h2 className="text-xl font-semibold mb-6">Cumulative Income Distribution (Lorenz Curve)</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="decile" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="share" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="p-6 border rounded-xl bg-card mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Allocation Decisions</h2>
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-2">Job</th>
              <th className="px-4 py-2">Assigned Worker</th>
              <th className="px-4 py-2">Primary Factor</th>
              <th className="px-4 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
             <tr className="border-b"><td className="px-4 py-2">Plumbing (#B-101)</td><td className="px-4 py-2">Ramesh Patel</td><td className="px-4 py-2">Lowest recent jobs (Fairness)</td><td className="px-4 py-2">95</td></tr>
             <tr className="border-b"><td className="px-4 py-2">Electrical (#B-102)</td><td className="px-4 py-2">Suresh Kumar</td><td className="px-4 py-2">Closest proximity (Distance)</td><td className="px-4 py-2">88</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
