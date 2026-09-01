import { Suspense } from "react"
import { StatCard } from "@/components/shared/stat-card"
import { prisma } from "@/lib/prisma"
import { BarChart, LineChart } from "@/components/shared/charts"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export const dynamic = 'force-dynamic'

async function getOverviewData() {
  const [
    activeWorkers,
    pendingVerification,
    todaysBookings,
    activeJobs,
    payments,
    openComplaints,
    recentBookings
  ] = await Promise.all([
    prisma.worker.count({ where: { verificationStatus: 'VERIFIED' } }),
    prisma.worker.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.booking.count({ 
      where: { 
        createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } 
      } 
    }),
    prisma.booking.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      select: { amount: true }
    }),
    prisma.complaint.count({ where: { status: 'OPEN' } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { 
        customer: { include: { user: true } }, 
        worker: { include: { user: true } }, 
        category: true 
      }
    })
  ])

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    activeWorkers,
    pendingVerification,
    todaysBookings,
    activeJobs,
    revenue: totalRevenue,
    openComplaints,
    recentBookings
  }
}

export default async function OverviewPage() {
  const data = await getOverviewData()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Active Workers" value={data.activeWorkers} />
        <Link href="/admin/verification">
          <StatCard title="Pending Verification" value={data.pendingVerification} description="Click to review" className="cursor-pointer hover:bg-muted/50 transition-colors" />
        </Link>
        <StatCard title="Today's Bookings" value={data.todaysBookings} />
        <StatCard title="Active Jobs" value={data.activeJobs} />
        <StatCard title="Total Revenue" value={formatCurrency(data.revenue)} />
        <StatCard title="Open Complaints" value={data.openComplaints} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Bookings (Recent Trend)</h3>
          <BarChart className="h-[280px] w-full" />
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend (Monthly)</h3>
          <LineChart className="h-[280px] w-full" />
        </div>
      </div>

      <div className="bg-white rounded-xl border p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Worker</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentBookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{b.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{b.customer?.user?.name || "Customer"}</td>
                  <td className="px-4 py-3 text-gray-600">{b.worker?.user?.name || "Unassigned"}</td>
                  <td className="px-4 py-3 text-gray-600">{b.category?.name || "Service"}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 text-xs rounded-full font-medium bg-blue-50 text-blue-700">
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.recentBookings.length === 0 && (
             <div className="p-4 text-center text-gray-400">No recent bookings</div>
          )}
        </div>
      </div>
    </div>
  )
}
