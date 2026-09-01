"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Dynamically import map components to avoid SSR issues with Leaflet
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false, loading: () => <Skeleton className="h-[400px] w-full" /> }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

import "leaflet/dist/leaflet.css";

interface LocationData {
  area: string;
  lat: number;
  lng: number;
  count: number;
}

interface DemandMapProps {
  demandData: LocationData[];
  supplyData?: LocationData[];
  title?: string;
  className?: string;
}

export function DemandMap({ demandData, supplyData, title = "Demand Heatmap", className }: DemandMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const ahmadabadCenter: [number, number] = [23.0225, 72.5714];

  useEffect(() => {
    setIsMounted(true);
    
    // Fix Leaflet icon issue in Next.js
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default?.src || "/marker-icon-2x.png",
        iconUrl: require("leaflet/dist/images/marker-icon.png").default?.src || "/marker-icon.png",
        shadowUrl: require("leaflet/dist/images/marker-shadow.png").default?.src || "/marker-shadow.png",
      });
    }
  }, []);

  if (!isMounted) return <Skeleton className={cn("h-[400px] w-full", className)} />;

  return (
    <Card className={cn("overflow-hidden flex flex-col", className)}>
      <CardHeader className="p-4 pb-2 z-10 bg-background relative shadow-sm">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex gap-4 text-xs mt-2">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500 opacity-60"></span> Demand
          </div>
          {supplyData && (
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 opacity-60"></span> Supply
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative min-h-[400px]">
        <MapContainer 
          center={ahmadabadCenter} 
          zoom={12} 
          style={{ height: "100%", width: "100%", position: "absolute", inset: 0 }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles"
          />
          
          {demandData.map((loc, idx) => (
            <CircleMarker
              key={`demand-${idx}`}
              center={[loc.lat, loc.lng]}
              radius={Math.max(10, Math.min(30, loc.count * 2))}
              fillColor="#ef4444" // red
              fillOpacity={0.5}
              color="#b91c1c"
              weight={1}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{loc.area}</strong><br />
                  Demand: {loc.count} requests
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {supplyData && supplyData.map((loc, idx) => (
            <CircleMarker
              key={`supply-${idx}`}
              center={[loc.lat, loc.lng]}
              radius={Math.max(10, Math.min(30, loc.count * 2))}
              fillColor="#3b82f6" // blue
              fillOpacity={0.5}
              color="#1d4ed8"
              weight={1}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{loc.area}</strong><br />
                  Available Workers: {loc.count}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </CardContent>
    </Card>
  );
}
