'use client'
import { StatCard } from '@/components/shared/stat-card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function ImpactClient({ stats, chartData }: { stats: any, chartData: any }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cooperative Impact</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Workers Supported" value={stats.workersSupported.toLocaleString()} description="Registered in network" />
        <StatCard title="Jobs Completed" value={stats.jobsCompleted.toLocaleString()} description="Total successful bookings" />
        <StatCard title="Total Earnings Generated" value={`₹${stats.totalEarnings.toLocaleString()}`} description="Directly to workers" />
        <StatCard title="Customer Satisfaction" value={`${stats.avgRating}/5`} description={`Based on ${stats.ratingCount} ratings`} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
         <div className="p-6 border rounded-xl bg-card">
           <h2 className="text-xl font-semibold mb-6">Work Distribution</h2>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value" label>
                   {chartData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
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
