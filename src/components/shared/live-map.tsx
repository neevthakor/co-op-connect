'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Next.js dynamic import for Leaflet (must disable SSR for window object)
const MapContainer = dynamic(() => import('react-leaflet').then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(m => m.Popup), { ssr: false });

interface LocationMarker {
  lat: number;
  lng: number;
  label: string;
  isWorker?: boolean;
}

export function LiveMap({
  markers,
  height = '300px',
  center,
}: {
  markers: LocationMarker[];
  height?: string;
  center?: [number, number];
}) {
  const [mounted, setMounted] = useState(false);
  const [icons, setIcons] = useState<any>(null);

  useEffect(() => {
    // Only load Leaflet on the client
    setMounted(true);
    
    // Fix Leaflet's default icon path issues in React
    import('leaflet').then((L) => {
      const customerIcon = new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Simple red hue shift for worker using filter in CSS, or a different icon. We'll use default.
      const workerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      setIcons({ customerIcon, workerIcon });
    });
  }, []);

  if (!mounted || !icons) {
    return (
      <Card>
        <CardContent className={`flex items-center justify-center p-6 border rounded-lg bg-gray-50`} style={{ height }}>
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Calculate default center if not provided
  const mapCenter: [number, number] = center || 
    (markers.length > 0 ? [markers[0].lat, markers[0].lng] : [23.0225, 72.5714]); // Default to Ahmedabad

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border shadow-sm z-0 relative">
      <MapContainer 
        center={mapCenter} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((m, i) => (
          <Marker 
            key={i} 
            position={[m.lat, m.lng]} 
            icon={m.isWorker ? icons.workerIcon : icons.customerIcon}
          >
            <Popup>{m.label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
