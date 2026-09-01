import os

base_path = r"c:\TeraBoxDownload\sih\co-op-connect\src\app\admin"

pages = {
    r"workers\page.tsx": """'use client'

import { useState, useEffect } from "react"
import Link from "next/link"

export default function WorkersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Worker Management</h1>
      <div className="p-4 bg-card rounded-xl border">
        {/* DataTable placeholder */}
        <p>Workers DataTable goes here.</p>
        <Link href="/admin/workers/123" className="text-blue-500 hover:underline">View Worker Detail (Demo)</Link>
      </div>
    </div>
  )
}
""",
    r"workers\[id]\page.tsx": """import prisma from "@/lib/prisma"

export default async function WorkerDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Worker Detail: {params.id}</h1>
      <div className="p-4 bg-card rounded-xl border">
         <p>Profile Header and Tabs Placeholder</p>
      </div>
    </div>
  )
}
""",
    r"bookings\page.tsx": """export default function BookingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
      <div className="p-4 bg-card rounded-xl border">
         <p>DataTable of bookings goes here.</p>
      </div>
    </div>
  )
}
""",
    r"live-map\page.tsx": """'use client'

export default function LiveMapPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Live Demand-Supply Map</h1>
      <div className="h-[600px] bg-muted/20 rounded-xl flex items-center justify-center border">
         <p>DemandMap component (Leaflet) goes here.</p>
      </div>
    </div>
  )
}
""",
    r"fairmatch\page.tsx": """export default function FairMatchPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Fairness Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
         <div className="p-4 bg-card rounded-xl border"><p>Fairness Score</p></div>
         <div className="p-4 bg-card rounded-xl border"><p>Allocation Chart</p></div>
      </div>
    </div>
  )
}
""",
    r"helpers\page.tsx": """export default function HelpersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Helper Network</h1>
      <div className="p-4 bg-card rounded-xl border"><p>Helper Requests List</p></div>
    </div>
  )
}
""",
    r"teams\page.tsx": """export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Team Formation</h1>
      <div className="p-4 bg-card rounded-xl border"><p>Active Teams List</p></div>
    </div>
  )
}
""",
    r"demand\page.tsx": """export default function DemandPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Demand Analytics</h1>
      <div className="p-4 bg-card rounded-xl border"><p>Demand Charts</p></div>
    </div>
  )
}
""",
    r"forecast\page.tsx": """export default function ForecastPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">AI Demand Forecasting</h1>
      <div className="p-4 bg-card rounded-xl border"><p>ForecastChart</p></div>
    </div>
  )
}
""",
    r"capacity\page.tsx": """export default function CapacityPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Worker Capacity Planner</h1>
      <div className="p-4 bg-card rounded-xl border"><p>CapacityPlanner Component</p></div>
    </div>
  )
}
""",
    r"skill-gaps\page.tsx": """export default function SkillGapsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Skill Gap Detection</h1>
      <div className="p-4 bg-card rounded-xl border"><p>SkillGapCard List</p></div>
    </div>
  )
}
""",
    r"finance\page.tsx": """export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
      <div className="p-4 bg-card rounded-xl border"><p>Financial Stats & Charts</p></div>
    </div>
  )
}
""",
    r"welfare\page.tsx": """export default function WelfarePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Worker Welfare Monitor</h1>
      <div className="p-4 bg-card rounded-xl border"><p>WelfareCards & Stats</p></div>
    </div>
  )
}
""",
    r"disputes\page.tsx": """export default function DisputesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dispute Resolution</h1>
      <div className="p-4 bg-card rounded-xl border"><p>DisputeSummary List</p></div>
    </div>
  )
}
""",
    r"fraud\page.tsx": """export default function FraudPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Fraud Detection</h1>
      <div className="p-4 bg-card rounded-xl border"><p>FraudAlert Cards</p></div>
    </div>
  )
}
""",
    r"impact\page.tsx": """export default function ImpactPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cooperative Impact Dashboard</h1>
      <div className="p-4 bg-card rounded-xl border"><p>Impact StatCards & Charts</p></div>
    </div>
  )
}
""",
    r"voting\page.tsx": """export default function VotingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cooperative Voting</h1>
      <div className="p-4 bg-card rounded-xl border"><p>Proposals List</p></div>
    </div>
  )
}
""",
    r"settings\page.tsx": """export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      <div className="p-4 bg-card rounded-xl border"><p>Matching Weights & Configs</p></div>
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

print("Created all pages.")
