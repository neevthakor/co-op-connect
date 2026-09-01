import { Button } from '@/components/ui/button'

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
