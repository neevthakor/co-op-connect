import { prisma } from '@/lib/prisma'

export default async function HelpersPage() {
  const activeRequests = await prisma.helperRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      booking: { include: { category: true } },
      leadWorker: { include: { user: true } },
      requiredSkill: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const availableHelpersCount = await prisma.worker.count({
    where: {
      availabilityStatus: 'AVAILABLE'
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Helper Network</h1>
      <div className="grid gap-4">
         <div className="p-4 border rounded-xl bg-card">
           <h3 className="font-semibold text-lg mb-4">Active Helper Requests</h3>
           {activeRequests.length === 0 ? (
             <p className="text-muted-foreground">No active requests currently.</p>
           ) : (
             <div className="space-y-4">
               {activeRequests.map(req => (
                 <div key={req.id} className="p-4 border rounded-lg flex justify-between items-center">
                   <div>
                     <h4 className="font-semibold">Request by {req.leadWorker?.user?.name || 'Unknown'}</h4>
                     <p className="text-sm text-muted-foreground">
                       For {req.booking?.category?.name || 'Booking'} • Needed Skill: {req.requiredSkill?.name || 'Any'}
                     </p>
                   </div>
                   <div className="badge bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-sm font-medium">
                     {req.status}
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
         <div className="p-4 border rounded-xl bg-card">
           <h3 className="font-semibold text-lg">Available Helpers</h3>
           <p className="text-muted-foreground">{availableHelpersCount} workers online in network.</p>
         </div>
      </div>
    </div>
  )
}
