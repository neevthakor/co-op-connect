'use client'
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
