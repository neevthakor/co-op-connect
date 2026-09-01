'use client'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-xl bg-card space-y-6">
          <h2 className="text-xl font-semibold">Algorithm Matching Weights</h2>
          <p className="text-sm text-muted-foreground mb-4">Adjust how the matchmaking AI prioritizes different factors when assigning jobs to workers.</p>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Proximity / Distance</label><span>40%</span></div>
              <input type="range" className="w-full" defaultValue={40} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Fairness / Idle Time</label><span>35%</span></div>
              <input type="range" className="w-full" defaultValue={35} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><label>Rating & Skills</label><span>25%</span></div>
              <input type="range" className="w-full" defaultValue={25} />
            </div>
          </div>
          <Button className="w-full">Save Algorithm Weights</Button>
        </div>

        <div className="p-6 border rounded-xl bg-card space-y-6">
           <h2 className="text-xl font-semibold">Platform Fee Configuration</h2>
           <div className="space-y-4">
             <div>
               <label className="text-sm font-medium mb-1 block">Base Platform Fee (%)</label>
               <input type="number" className="w-full border rounded px-3 py-2" defaultValue={10} />
             </div>
             <div>
               <label className="text-sm font-medium mb-1 block">Welfare Fund Contribution (%)</label>
               <input type="number" className="w-full border rounded px-3 py-2" defaultValue={1.5} />
             </div>
           </div>
           <Button variant="secondary" className="w-full">Update Fees</Button>
        </div>
      </div>
    </div>
  )
}
