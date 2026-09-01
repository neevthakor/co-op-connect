'use client'
import { useEffect, useState } from 'react'

export default function LiveMapPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Live Demand-Supply Map</h1>
      <div className="p-4 bg-muted/20 border rounded-xl flex items-center justify-center min-h-[600px] flex-col">
        <p className="text-lg text-muted-foreground mb-4">Leaflet Map Placeholder (Centered on Ahmedabad: 23.0225, 72.5714)</p>
        <div className="flex gap-4">
          <label className="flex items-center gap-2"><input type="checkbox" checked readOnly/> Demand Heatmap</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked readOnly/> Supply Markers</label>
        </div>
      </div>
    </div>
  )
}
