export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Team Formation</h1>
      <div className="p-6 border rounded-xl bg-card">
        <h2 className="text-xl font-semibold mb-4">Active Teams</h2>
        <div className="space-y-4">
           <div className="p-4 border rounded-lg flex justify-between items-center">
             <div>
               <h4 className="font-semibold">Team Alpha (Electrical Installation)</h4>
               <p className="text-sm text-muted-foreground">3 Members • 60/40 Split</p>
             </div>
             <div className="badge bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm">Active Job</div>
           </div>
        </div>
      </div>
    </div>
  )
}
