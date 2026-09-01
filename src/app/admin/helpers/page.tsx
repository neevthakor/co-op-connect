export default function HelpersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Helper Network</h1>
      <div className="grid gap-4">
         <div className="p-4 border rounded-xl bg-card">
           <h3 className="font-semibold text-lg">Active Helper Requests</h3>
           <p className="text-muted-foreground">No active requests currently.</p>
         </div>
         <div className="p-4 border rounded-xl bg-card">
           <h3 className="font-semibold text-lg">Available Helpers</h3>
           <p className="text-muted-foreground">24 helpers online in network.</p>
         </div>
      </div>
    </div>
  )
}
