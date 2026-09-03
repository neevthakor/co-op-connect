import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

export default async function FraudPage() {
  const alerts = await prisma.fraudAlert.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Fraud Detection</h1>
      <div className="space-y-4">
         {alerts.map(a => (
           <div key={a.id} className="p-6 border rounded-xl bg-card flex justify-between items-start">
             <div>
               <div className="flex gap-2 items-center mb-2">
                 <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL' ? 'bg-red-600' : 'bg-amber-500'}`}>{a.riskLevel} RISK</span>
                 <h3 className="font-bold text-lg">{a.type}</h3>
               </div>
               <p className="text-sm font-medium">Entity: {a.entityType} ({a.entityId})</p>
               <p className="text-muted-foreground mt-2">{a.reason}</p>
             </div>
             <div className="flex flex-col gap-2">
               <span className="text-xs text-muted-foreground text-right">{new Date(a.createdAt).toLocaleDateString()}</span>
               <Button size="sm">Investigate</Button>
               <Button size="sm" variant="outline">Dismiss</Button>
             </div>
           </div>
         ))}
         {alerts.length === 0 && (
           <div className="p-6 border rounded-xl bg-card text-center text-muted-foreground">
             No fraud alerts detected.
           </div>
         )}
      </div>
    </div>
  )
}
