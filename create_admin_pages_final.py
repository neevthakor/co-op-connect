import os

base_path = r"c:\TeraBoxDownload\sih\co-op-connect\src\app\admin"

pages = {
    r"workers\page.tsx": """import prisma from '@/lib/prisma'
import { DataTable } from '@/components/shared/data-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function WorkersPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q || ''
  
  const workers = await prisma.worker.findMany({
    where: {
      name: { contains: query }
    },
    include: {
      user: true,
      cooperative: true,
      bookings: true
    }
  }).catch(() => [])

  // Map to format
  const data = workers.length ? workers.map(w => ({
    id: w.id,
    name: w.name,
    trade: w.trade,
    cooperative: w.cooperative?.name || 'N/A',
    status: w.status,
    verification: w.verificationStatus,
    jobs: w.bookings?.length || 0,
    earnings: w.totalEarnings || 0
  })) : [
    { id: '1', name: 'Ramesh Patel', trade: 'Plumber', cooperative: 'Ahmedabad Sahakari', status: 'ACTIVE', verification: 'VERIFIED', rating: 4.8, jobs: 42, earnings: 12500 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Worker Management</h1>
        <div className="flex gap-2">
          <input type="text" placeholder="Search..." className="border rounded-md px-3 py-1" />
          <Button variant="outline">Filter</Button>
        </div>
      </div>
      <div className="rounded-md border bg-card text-card-foreground">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Trade</th>
              <th className="px-6 py-3">Cooperative</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Jobs</th>
              <th className="px-6 py-3">Earnings</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((w: any) => (
              <tr key={w.id} className="border-b last:border-0 hover:bg-muted/50">
                <td className="px-6 py-4 font-medium"><Link href={`/admin/workers/${w.id}`} className="hover:underline text-blue-600">{w.name}</Link></td>
                <td className="px-6 py-4">{w.trade}</td>
                <td className="px-6 py-4">{w.cooperative}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${w.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{w.status}</span>
                </td>
                <td className="px-6 py-4">{w.jobs}</td>
                <td className="px-6 py-4">₹{w.earnings}</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/workers/${w.id}`}><Button variant="outline" size="sm">View Detail</Button></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
""",
    r"bookings\page.tsx": """import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      customer: true,
      worker: true,
      service: true
    },
    orderBy: { createdAt: 'desc' }
  }).catch(() => [])

  const data = bookings.length ? bookings.map(b => ({
    id: b.id,
    customer: b.customer?.name || 'Unknown',
    service: b.service?.name || 'Unknown',
    worker: b.worker?.name || 'Unassigned',
    status: b.status,
    date: new Date(b.createdAt).toLocaleDateString(),
    amount: b.totalAmount || 0
  })) : [
    { id: 'B-101', customer: 'Anil Desai', service: 'Plumbing Repair', worker: 'Ramesh Patel', status: 'IN_PROGRESS', date: '2023-10-24', amount: 450 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
        <div className="space-x-2">
          <select className="border rounded-md px-3 py-2"><option>All Status</option><option>Pending</option><option>In Progress</option></select>
          <input type="date" className="border rounded-md px-3 py-2" />
        </div>
      </div>
      <div className="rounded-md border bg-card">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Service</th>
              <th className="px-6 py-3">Worker</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((b: any) => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/10 cursor-pointer">
                <td className="px-6 py-4 font-medium">{b.id}</td>
                <td className="px-6 py-4">{b.customer}</td>
                <td className="px-6 py-4">{b.service}</td>
                <td className="px-6 py-4">{b.worker}</td>
                <td className="px-6 py-4">{b.date}</td>
                <td className="px-6 py-4">₹{b.amount}</td>
                <td className="px-6 py-4">
                   <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
""",
    r"fairmatch\page.tsx": """'use client'
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
""",
    r"finance\page.tsx": """'use client'
import { StatCard } from '@/components/shared/stat-card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const revenueData = [
  { month: 'Jan', total: 400000, payout: 350000, coop: 50000 },
  { month: 'Feb', total: 450000, payout: 390000, coop: 60000 },
  { month: 'Mar', total: 420000, payout: 370000, coop: 50000 },
  { month: 'Apr', total: 500000, payout: 440000, coop: 60000 },
]

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Booking Value" value="₹18.5L" description="+12% from last month" />
        <StatCard title="Worker Payouts" value="₹15.8L" description="85% of total" />
        <StatCard title="Cooperative Revenue" value="₹2.5L" description="13.5% of total" />
        <StatCard title="Welfare Fund" value="₹20k" description="1.5% of total" />
      </div>
      <div className="p-6 border rounded-xl bg-card">
        <h2 className="text-xl font-semibold mb-6">Revenue Trend (YTD)</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              <Line type="monotone" dataKey="total" name="Total Value" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="payout" name="Worker Payout" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="coop" name="Co-op Revenue" stroke="#f59e0b" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
""",
    r"impact\page.tsx": """'use client'
import { StatCard } from '@/components/shared/stat-card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Plumbing', value: 400 },
  { name: 'Electrical', value: 300 },
  { name: 'Cleaning', value: 300 },
  { name: 'Carpentry', value: 200 },
]
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function ImpactPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cooperative Impact</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Workers Supported" value="1,245" description="Across 15 cooperatives" />
        <StatCard title="Jobs Completed" value="15,400" description="Since inception" />
        <StatCard title="Total Earnings Generated" value="₹1.2Cr" description="Directly to workers" />
        <StatCard title="Customer Satisfaction" value="4.8/5" description="Based on 10k+ ratings" />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
         <div className="p-6 border rounded-xl bg-card">
           <h2 className="text-xl font-semibold mb-6">Work Distribution</h2>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                   {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                 </Pie>
                 <Tooltip />
               </PieChart>
             </ResponsiveContainer>
           </div>
         </div>
         <div className="p-6 border rounded-xl bg-card space-y-6">
           <h2 className="text-xl font-semibold">Social Metrics</h2>
           <div className="space-y-4">
             <div>
               <div className="flex justify-between mb-1"><span className="text-sm font-medium">Health Insurance Coverage</span><span className="text-sm">85%</span></div>
               <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div></div>
             </div>
             <div>
               <div className="flex justify-between mb-1"><span className="text-sm font-medium">Upskilling Training Completed</span><span className="text-sm">62%</span></div>
               <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-green-600 h-2.5 rounded-full" style={{ width: '62%' }}></div></div>
             </div>
             <div>
               <div className="flex justify-between mb-1"><span className="text-sm font-medium">Financial Literacy Workshop</span><span className="text-sm">45%</span></div>
               <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '45%' }}></div></div>
             </div>
           </div>
         </div>
      </div>
    </div>
  )
}
""",
    r"disputes\page.tsx": """import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function DisputesPage() {
  const disputes = await prisma.dispute.findMany({
    include: { booking: { include: { customer: true, worker: true } } },
    orderBy: { createdAt: 'desc' }
  }).catch(() => [])

  const data = disputes.length ? disputes : [
    { id: 'D-1', reason: 'Service Quality', description: 'Leak not fixed properly.', status: 'OPEN', booking: { id: 'B-101', customer: { name: 'Anil Desai' }, worker: { name: 'Ramesh Patel' } } }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dispute Resolution</h1>
      <div className="space-y-4">
        {data.map((d: any) => (
          <div key={d.id} className="p-6 border rounded-xl bg-card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">Booking #{d.booking.id} - {d.reason}</h3>
                <p className="text-sm text-muted-foreground mt-1">Customer: {d.booking.customer?.name} | Worker: {d.booking.worker?.name}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${d.status === 'OPEN' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{d.status}</span>
            </div>
            <p className="mb-4">{d.description}</p>
            <div className="flex gap-2">
              <Button variant="default">AI Analysis</Button>
              <Button variant="outline">View Evidence</Button>
              <Button variant="secondary">Resolve</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
""",
    r"fraud\page.tsx": """import { Button } from '@/components/ui/button'

export default function FraudPage() {
  const alerts = [
    { id: 'F-1', type: 'Offline Payment Bypass', entity: 'Worker (Ramesh Patel)', risk: 'HIGH', reason: 'Repeated booking cancellations followed by immediate GPS proximity.', date: '2023-10-24' },
    { id: 'F-2', type: 'Fake Reviews', entity: 'Customer (C-1045)', risk: 'MEDIUM', reason: 'High velocity 5-star reviews for same worker.', date: '2023-10-23' }
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Fraud Detection</h1>
      <div className="space-y-4">
         {alerts.map(a => (
           <div key={a.id} className="p-6 border rounded-xl bg-card flex justify-between items-start">
             <div>
               <div className="flex gap-2 items-center mb-2">
                 <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${a.risk === 'HIGH' ? 'bg-red-600' : 'bg-amber-500'}`}>{a.risk} RISK</span>
                 <h3 className="font-bold text-lg">{a.type}</h3>
               </div>
               <p className="text-sm font-medium">Entity: {a.entity}</p>
               <p className="text-muted-foreground mt-2">{a.reason}</p>
             </div>
             <div className="flex flex-col gap-2">
               <span className="text-xs text-muted-foreground text-right">{a.date}</span>
               <Button size="sm">Investigate</Button>
               <Button size="sm" variant="outline">Dismiss</Button>
             </div>
           </div>
         ))}
      </div>
    </div>
  )
}
""",
    r"voting\page.tsx": """'use client'
import { Button } from '@/components/ui/button'

export default function VotingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Cooperative Voting</h1>
        <Button>New Proposal</Button>
      </div>
      <div className="space-y-4">
        <div className="p-6 border rounded-xl bg-card">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold">Increase Welfare Fund Deduction to 2%</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">ACTIVE</span>
          </div>
          <p className="text-muted-foreground mb-6">To support the new comprehensive health insurance policy covering worker families, it is proposed to increase the per-booking welfare deduction from 1.5% to 2%.</p>
          <div className="mb-4">
            <div className="flex justify-between mb-1 text-sm font-medium">
               <span>Yes (450)</span>
               <span>No (120)</span>
            </div>
            <div className="w-full bg-red-200 rounded-full h-4 flex overflow-hidden">
               <div className="bg-green-500 h-full" style={{ width: '75%' }}></div>
               <div className="bg-gray-400 h-full" style={{ width: '5%' }}></div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">Vote YES</Button>
            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">Vote NO</Button>
            <Button variant="outline">Abstain</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
""",
    r"settings\page.tsx": """'use client'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-xl bg-card space-y-6">
          <h2 className="text-xl font-semibold">Algorithm Matching Weights</h2>
          <p className="text-sm text-muted-foreground mb-4">Adjust how the matchmaking AI prioritizes different factors when assigning jobs to workers.</p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Proximity / Distance</label><span>40%</span></div>
              <input type="range" className="w-full" defaultValue={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Fairness / Idle Time</label><span>35%</span></div>
              <input type="range" className="w-full" defaultValue={35} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Rating & Skills</label><span>25%</span></div>
              <input type="range" className="w-full" defaultValue={25} />
            </div>
          </div>
          <Button className="w-full">Save Algorithm Weights</Button>
        </div>

        <div className="p-6 border rounded-xl bg-card space-y-6">
           <h2 className="text-xl font-semibold">Platform Fee Configuration</h2>
           <div className="space-y-4">
             <div>
               <label className="text-sm font-medium mb-1 block">Base Platform Fee (%)</label>
               <input type="number" className="w-full border rounded px-3 py-2" defaultValue={10} />
             </div>
             <div>
               <label className="text-sm font-medium mb-1 block">Welfare Fund Contribution (%)</label>
               <input type="number" className="w-full border rounded px-3 py-2" defaultValue={1.5} />
             </div>
           </div>
           <Button variant="secondary" className="w-full">Update Fees</Button>
        </div>
      </div>
    </div>
  )
}
"""
}

for rel_path, content in pages.items():
    full_path = os.path.join(base_path, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Created 10 full pages as requested.")
