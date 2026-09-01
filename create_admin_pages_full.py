import os

base_path = r"c:\TeraBoxDownload\sih\co-op-connect\src\app\admin"

pages = {
    r"workers\page.tsx": """'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/shared/data-table'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function WorkersPage() {
  const [workers, setWorkers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchWorkers()
  }, [])

  const fetchWorkers = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/workers')
      if (res.ok) {
        const data = await res.json()
        setWorkers(data)
      } else {
        setWorkers([
          { id: '1', name: 'Ramesh Patel', trade: 'Plumber', cooperative: 'Ahmedabad Sahakari', status: 'ACTIVE', verification: 'VERIFIED', rating: 4.8, jobs: 42, earnings: 12500 }
        ])
      }
    } catch (e) {
      setWorkers([
          { id: '1', name: 'Ramesh Patel', trade: 'Plumber', cooperative: 'Ahmedabad Sahakari', status: 'ACTIVE', verification: 'VERIFIED', rating: 4.8, jobs: 42, earnings: 12500 }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Worker Management</h1>
      <div className="rounded-md border bg-card text-card-foreground">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Trade</th>
              <th className="px-6 py-3">Cooperative</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3">Jobs</th>
              <th className="px-6 py-3">Earnings</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workers.map((w: any) => (
              <tr key={w.id} className="border-b last:border-0">
                <td className="px-6 py-4 font-medium"><Link href={`/admin/workers/${w.id}`} className="hover:underline">{w.name}</Link></td>
                <td className="px-6 py-4">{w.trade}</td>
                <td className="px-6 py-4">{w.cooperative}</td>
                <td className="px-6 py-4">{w.status}</td>
                <td className="px-6 py-4">{w.rating}</td>
                <td className="px-6 py-4">{w.jobs}</td>
                <td className="px-6 py-4">₹{w.earnings}</td>
                <td className="px-6 py-4">
                  <Link href={`/admin/workers/${w.id}`}><Button variant="outline" size="sm">View</Button></Link>
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
    r"workers\[id]\page.tsx": """import prisma from '@/lib/prisma'
import { WorkerCard } from '@/components/shared/worker-card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/shared/stat-card'

export const dynamic = 'force-dynamic'

export default async function WorkerDetailPage({ params }: { params: { id: string } }) {
  const worker = await prisma.worker.findUnique({
    where: { id: params.id },
    include: { skills: true, bookings: true, documents: true }
  }).catch(() => null)

  const mockWorker = worker || {
    id: params.id, name: 'Ramesh Patel', trade: 'Plumber', cooperative: 'Ahmedabad Sahakari', status: 'ACTIVE',
    bio: 'Experienced plumber with 10 years of service.', experience: '10 years',
    skills: [{ id: '1', name: 'Pipe Fitting', proficiency: 'EXPERT' }]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Worker Detail</h1>
        <div className="space-x-2">
           <Button variant="destructive">Suspend Worker</Button>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-xl bg-card">
          <h2 className="text-2xl font-semibold mb-2">{mockWorker.name}</h2>
          <p className="text-muted-foreground">{mockWorker.trade} • {mockWorker.cooperative}</p>
          <div className="mt-4 space-y-2">
            <p><strong>Status:</strong> {mockWorker.status}</p>
            <p><strong>Bio:</strong> {mockWorker.bio}</p>
            <p><strong>Experience:</strong> {mockWorker.experience}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <StatCard title="Total Earnings" value="₹12,500" />
          <StatCard title="Completed Jobs" value="42" />
        </div>
      </div>

      <div className="border rounded-xl p-6 bg-card">
        <h3 className="text-xl font-semibold mb-4">Skills & Certifications</h3>
        <ul className="list-disc pl-5">
          {mockWorker.skills.map((s: any) => (
            <li key={s.id}>{s.name} - {s.proficiency}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
""",
    r"bookings\page.tsx": """'use client'
import { useState, useEffect } from 'react'

export default function BookingsPage() {
  const [bookings, setBookings] = useState([{ id: 'B-101', customer: 'Anil Desai', service: 'Plumbing Repair', worker: 'Ramesh Patel', status: 'IN_PROGRESS', date: '2023-10-24', amount: 450 }])

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
      <div className="rounded-md border bg-card text-card-foreground">
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
            {bookings.map(b => (
              <tr key={b.id} className="border-b last:border-0 hover:bg-muted/10 cursor-pointer">
                <td className="px-6 py-4">{b.id}</td>
                <td className="px-6 py-4">{b.customer}</td>
                <td className="px-6 py-4">{b.service}</td>
                <td className="px-6 py-4">{b.worker}</td>
                <td className="px-6 py-4">{b.date}</td>
                <td className="px-6 py-4">₹{b.amount}</td>
                <td className="px-6 py-4">{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
""",
    r"live-map\page.tsx": """'use client'
import { useEffect, useState } from 'react'

export default function LiveMapPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Live Demand-Supply Map</h1>
      <div className="p-4 bg-muted/20 border rounded-xl flex items-center justify-center min-h-[600px] flex-col">
        <p className="text-lg text-muted-foreground mb-4">Leaflet Map Placeholder (Centered on Ahmedabad: 23.0225, 72.5714)</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked readOnly/> Demand Heatmap</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked readOnly/> Supply Markers</label>
        </div>
      </div>
    </div>
  )
}
""",
    r"fairmatch\page.tsx": """'use client'
import { StatCard } from '@/components/shared/stat-card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { worker: 'Ramesh', jobs: 12 },
  { worker: 'Suresh', jobs: 10 },
  { worker: 'Kamlesh', jobs: 15 },
  { worker: 'Naresh', jobs: 11 },
]

export default function FairMatchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Fairness Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Overall Fairness Score" value="92%" description="Excellent Distribution" />
        <StatCard title="Avg Jobs / Worker" value="12" />
        <StatCard title="Income Gini Coefficient" value="0.21" description="Low Inequality" />
      </div>
      <div className="p-6 border rounded-xl bg-card">
        <h2 className="text-xl font-semibold mb-6">Job Allocation Distribution</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="worker" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jobs" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
""",
    r"helpers\page.tsx": """export default function HelpersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Helper Network</h1>
      <div className="grid gap-4">
         <div className="p-4 border rounded-xl bg-card">
           <h3 className="font-semibold text-lg">Active Helper Requests</h3>
           <p className="text-muted-foreground">No active requests currently.</p>
         </div>
         <div className="p-4 border rounded-xl bg-card">
           <h3 className="font-semibold text-lg">Available Helpers</h3>
           <p className="text-muted-foreground">24 helpers online in network.</p>
         </div>
      </div>
    </div>
  )
}
""",
    r"teams\page.tsx": """export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Team Formation</h1>
      <div className="p-6 border rounded-xl bg-card">
        <h2 className="text-xl font-semibold mb-4">Active Teams</h2>
        <div className="space-y-4">
           <div className="p-4 border rounded-lg flex justify-between items-center">
             <div>
               <h4 className="font-semibold">Team Alpha (Electrical Installation)</h4>
               <p className="text-sm text-muted-foreground">3 Members • 60/40 Split</p>
             </div>
             <div className="badge bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm">Active Job</div>
           </div>
        </div>
      </div>
    </div>
  )
}
""",
    r"demand\page.tsx": """'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { day: 'Mon', plumbing: 20, electrical: 15 },
  { day: 'Tue', plumbing: 25, electrical: 18 },
  { day: 'Wed', plumbing: 22, electrical: 24 },
  { day: 'Thu', plumbing: 30, electrical: 20 },
  { day: 'Fri', plumbing: 28, electrical: 35 },
]

export default function DemandPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Demand Analytics</h1>
      <div className="p-6 border rounded-xl bg-card">
        <h2 className="text-xl font-semibold mb-6">Historical Demand</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="plumbing" stroke="#8884d8" />
              <Line type="monotone" dataKey="electrical" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
""",
    r"forecast\page.tsx": """export default function ForecastPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Demand Forecasting</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-xl bg-card">
          <h2 className="text-xl font-semibold mb-4">7-Day Forecast</h2>
          <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded">
            Forecast Chart (Area/Service)
          </div>
        </div>
        <div className="p-6 border rounded-xl bg-card space-y-4">
          <h2 className="text-xl font-semibold">AI Insights</h2>
          <p className="p-3 bg-blue-500/10 text-blue-600 rounded">💡 Expect 25% surge in AC repair requests this weekend due to heatwave.</p>
          <p className="p-3 bg-amber-500/10 text-amber-600 rounded">⚠️ Deep cleaning services demand is trending down.</p>
        </div>
      </div>
    </div>
  )
}
""",
    r"capacity\page.tsx": """export default function CapacityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Worker Capacity Planner</h1>
      <div className="rounded-md border bg-card">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Expected Demand</th>
              <th className="px-6 py-3">Available Workers</th>
              <th className="px-6 py-3">Gap</th>
              <th className="px-6 py-3">Recommendation</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-6 py-4 font-semibold">Electrician</td>
              <td className="px-6 py-4">45</td>
              <td className="px-6 py-4 text-red-500">20</td>
              <td className="px-6 py-4 text-red-500">-25</td>
              <td className="px-6 py-4">Activate dormant workers</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
""",
    r"skill-gaps\page.tsx": """export default function SkillGapsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Skill Gap Detection</h1>
      <div className="grid gap-4 md:grid-cols-2">
         <div className="p-6 border rounded-xl bg-card">
           <h3 className="text-lg font-bold mb-2">Solar Panel Installation (Navrangpura)</h3>
           <p>Demand: High</p>
           <p>Supply: Low (2 certified)</p>
           <p className="mt-4 text-sm text-blue-500">Recommendation: Organize training workshop next month.</p>
         </div>
      </div>
    </div>
  )
}
""",
    r"finance\page.tsx": """import { StatCard } from '@/components/shared/stat-card'

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Value" value="₹4.5L" />
        <StatCard title="Worker Payouts" value="₹3.8L" />
        <StatCard title="Co-op Revenue" value="₹45k" />
        <StatCard title="Welfare Fund" value="₹25k" />
      </div>
      <div className="p-6 border rounded-xl bg-card">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        <p className="text-muted-foreground mt-4">Transaction log...</p>
      </div>
    </div>
  )
}
""",
    r"welfare\page.tsx": """export default function WelfarePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Worker Welfare Monitor</h1>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div className="p-4 border rounded-xl bg-card"><p>Avg Hours/Week: 42</p></div>
        <div className="p-4 border rounded-xl bg-card"><p>Insured Workers: 85%</p></div>
        <div className="p-4 border rounded-xl bg-card"><p>Active Alerts: 3</p></div>
      </div>
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Welfare Alerts</h3>
        <div className="p-4 border rounded-xl bg-red-500/10 text-red-700">
          <strong>Ramesh Patel</strong> - Exceeding recommended working hours (55hrs this week)
        </div>
      </div>
    </div>
  )
}
""",
    r"disputes\page.tsx": """export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dispute Resolution</h1>
      <div className="space-y-4">
        <div className="p-6 border rounded-xl bg-card flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold">Booking #B-101 (Plumbing)</h3>
            <p className="text-sm mt-2">Customer claims leak not fixed. Worker uploaded video proof of fix.</p>
          </div>
          <div className="space-x-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded">AI Analysis</button>
            <button className="px-4 py-2 border rounded">Resolve</button>
          </div>
        </div>
      </div>
    </div>
  )
}
""",
    r"fraud\page.tsx": """export default function FraudPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Fraud Detection</h1>
      <div className="grid gap-4">
         <div className="p-4 border rounded-xl bg-card flex items-center justify-between">
           <div>
             <span className="badge bg-red-500 text-white px-2 py-1 rounded text-xs">HIGH RISK</span>
             <h3 className="font-bold mt-2">Multiple canceled bookings (Worker W-55)</h3>
             <p className="text-sm text-muted-foreground">Attempted offline transaction bypass.</p>
           </div>
           <div className="space-x-2">
             <button className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm">Review</button>
           </div>
         </div>
      </div>
    </div>
  )
}
""",
    r"impact\page.tsx": """import { StatCard } from '@/components/shared/stat-card'

export default function ImpactPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cooperative Impact Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Workers Supported" value="1,245" />
        <StatCard title="Jobs Completed" value="15,400" />
        <StatCard title="Total Earnings Generated" value="₹1.2Cr" />
        <StatCard title="Customer Satisfaction" value="4.8/5" />
      </div>
    </div>
  )
}
""",
    r"voting\page.tsx": """export default function VotingPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Cooperative Voting</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md">New Proposal</button>
      </div>
      <div className="space-y-4">
        <div className="p-6 border rounded-xl bg-card">
          <h3 className="text-lg font-bold">Proposal #45: Increase Welfare Fund Deduction by 1%</h3>
          <p className="text-sm mt-2 mb-4">To support new health insurance policy.</p>
          <div className="flex gap-4">
            <span className="text-green-600 font-bold">YES: 450</span>
            <span className="text-red-600 font-bold">NO: 120</span>
            <span className="text-gray-500 font-bold">ABSTAIN: 40</span>
          </div>
        </div>
      </div>
    </div>
  )
}
""",
    r"settings\page.tsx": """export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-xl bg-card space-y-4">
          <h2 className="text-xl font-semibold">Matching Weights</h2>
          <div>
            <label className="text-sm font-medium">Distance Weight</label>
            <input type="range" className="w-full" />
          </div>
          <div>
            <label className="text-sm font-medium">Fairness Weight</label>
            <input type="range" className="w-full" />
          </div>
          <div>
            <label className="text-sm font-medium">Rating Weight</label>
            <input type="range" className="w-full" />
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded mt-4">Save Weights</button>
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

print("Created all fully implemented pages.")
