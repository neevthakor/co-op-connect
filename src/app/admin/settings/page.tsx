'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const { toast } = useToast()
  
  const [weights, setWeights] = useState({ prox: 40, fair: 35, rating: 25 })
  const [fees, setFees] = useState({ platform: 10, welfare: 1.5 })
  
  const handleSaveWeights = () => {
    toast({ title: 'Algorithm Weights Updated', description: 'Matchmaking AI has been reconfigured successfully.' })
  }
  
  const handleUpdateFees = () => {
    toast({ title: 'Platform Fees Updated', description: 'Financial settings have been saved.' })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-xl bg-card space-y-6">
          <h2 className="text-xl font-semibold">Algorithm Matching Weights</h2>
          <p className="text-sm text-muted-foreground mb-4">Adjust how the matchmaking AI prioritizes different factors when assigning jobs to workers.</p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Proximity / Distance</label><span>{weights.prox}%</span></div>
              <input type="range" className="w-full" value={weights.prox} onChange={e => setWeights({...weights, prox: Number(e.target.value)})} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Fairness / Idle Time</label><span>{weights.fair}%</span></div>
              <input type="range" className="w-full" value={weights.fair} onChange={e => setWeights({...weights, fair: Number(e.target.value)})} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Rating & Skills</label><span>{weights.rating}%</span></div>
              <input type="range" className="w-full" value={weights.rating} onChange={e => setWeights({...weights, rating: Number(e.target.value)})} />
            </div>
          </div>
          <Button className="w-full" onClick={handleSaveWeights}>Save Algorithm Weights</Button>
        </div>

        <div className="p-6 border rounded-xl bg-card space-y-6">
           <h2 className="text-xl font-semibold">Platform Fee Configuration</h2>
           <div className="space-y-4">
             <div>
               <label className="text-sm font-medium mb-1 block">Base Platform Fee (%)</label>
               <input type="number" className="w-full border rounded px-3 py-2" value={fees.platform} onChange={e => setFees({...fees, platform: Number(e.target.value)})} />
             </div>
             <div>
               <label className="text-sm font-medium mb-1 block">Welfare Fund Contribution (%)</label>
               <input type="number" className="w-full border rounded px-3 py-2" step="0.1" value={fees.welfare} onChange={e => setFees({...fees, welfare: Number(e.target.value)})} />
             </div>
           </div>
           <Button variant="secondary" className="w-full" onClick={handleUpdateFees}>Update Fees</Button>
        </div>
      </div>
    </div>
  )
}
