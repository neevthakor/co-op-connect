import { prisma } from '@/lib/prisma'

export default async function TeamsPage() {
  const teams = await prisma.jobTeam.findMany({
    include: {
      booking: {
        include: { category: true }
      },
      leadWorker: {
        include: { user: true }
      },
      members: {
        include: { worker: { include: { user: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Team Formation</h1>
      <div className="p-6 border rounded-xl bg-card">
        <h2 className="text-xl font-semibold mb-4">Active Teams</h2>
        <div className="space-y-4">
           {teams.map(team => (
             <div key={team.id} className="p-4 border rounded-lg flex justify-between items-center">
               <div>
                 <h4 className="font-semibold">Team for {team.booking?.category?.name || 'Booking'} #{team.booking?.id.slice(-6)}</h4>
                 <p className="text-sm text-muted-foreground">
                   Lead: {team.leadWorker?.user?.name || 'Unknown'} • {team.members.length} Members
                 </p>
               </div>
               <div className={`badge px-3 py-1 rounded-full text-sm ${team.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'}`}>
                 {team.status}
               </div>
             </div>
           ))}
           {teams.length === 0 && (
             <p className="text-muted-foreground">No active teams.</p>
           )}
        </div>
      </div>
    </div>
  )
}
