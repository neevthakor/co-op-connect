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

  // Chart data
  const bookings = await prisma.booking.findMany({
    where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
    select: { createdAt: true }
  });
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const barChartData = days.map(d => ({ name: d, bookings: 0 }));
  bookings.forEach(b => {
    const day = days[new Date(b.createdAt).getDay()];
    const entry = barChartData.find(d => d.name === day);
    if (entry) entry.bookings++;
  });

  const allPayments = await prisma.payment.findMany({
    where: { status: 'COMPLETED', createdAt: { gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } },
    select: { amount: true, createdAt: true }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const lineChartData = Array.from({length: 6}).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return { name: months[d.getMonth()], revenue: 0, month: d.getMonth(), year: d.getFullYear() };
  });

  allPayments.forEach(p => {
    const d = new Date(p.createdAt);
    const entry = lineChartData.find(m => m.month === d.getMonth() && m.year === d.getFullYear());
    if (entry) entry.revenue += p.amount;
  });

  return {
    activeWorkers,
    pendingVerification,
    todaysBookings,
    activeJobs,
    revenue: totalRevenue,
    openComplaints,
    recentBookings,
    barChartData,
    lineChartData
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
          <BarChart data={data.barChartData} className="h-[280px] w-full" />
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend (Monthly)</h3>
          <LineChart data={data.lineChartData} className="h-[280px] w-full" />
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
