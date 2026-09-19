'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';
import { INDIA_STATES, INDIA_UNION_TERRITORIES, INDIA_CITIES } from '@/lib/locations/india';

interface LocationEditorProps {
  workerId: string;
  initialState: string;
  initialCity: string;
  initialAddress: string;
  initialLat: number | null;
  initialLng: number | null;
}

export function LocationEditor({
  workerId,
  initialState,
  initialCity,
  initialAddress,
  initialLat,
  initialLng,
}: LocationEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMsg, setLocationMsg] = useState('');
  
  const [formData, setFormData] = useState({
    state: initialState === 'Unspecified' ? '' : (initialState || ''),
    city: initialCity === 'Unspecified' ? '' : (initialCity || ''),
    address: initialAddress || '',
    latitude: initialLat,
    longitude: initialLng,
  });

  const handleLocation = () => {
    if (!navigator.geolocation) {
      setLocationMsg('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    setLocationMsg('Fetching location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocationMsg('Location successfully obtained!');
        setLocationLoading(false);
      },
      (error) => {
        setLocationMsg('Failed to get location.');
        setLocationLoading(false);
      }
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/workers/${workerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to update location');
      router.refresh();
      setLocationMsg('Location updated successfully!');
    } catch (err) {
      console.error(err);
      setLocationMsg('Failed to save location.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" /> My Service Location
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <label className="font-medium block mb-1 text-foreground">State / Union Territory</label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value, city: '' })}
              className="w-full p-2.5 border border-input rounded-md bg-background text-foreground text-sm h-10"
              disabled={loading}
            >
              <option value="">Select State or Union Territory</option>
              <optgroup label="States">
                {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </optgroup>
              <optgroup label="Union Territories">
                {INDIA_UNION_TERRITORIES.map(s => <option key={s} value={s}>{s}</option>)}
              </optgroup>
            </select>
          </div>
          <div>
            <label className="font-medium block mb-1 text-foreground">City</label>
            <select
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-2.5 border border-input rounded-md bg-background text-foreground text-sm h-10"
              disabled={loading || !formData.state}
            >
              <option value="">Select a city</option>
              {formData.state && INDIA_CITIES[formData.state]?.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="font-medium block mb-1 text-foreground text-sm">Operational Area Details</label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="e.g. Satellite / Vastrapur"
            disabled={loading}
          />
        </div>

        <div className="pt-2">
          <label className="font-medium block mb-2 text-foreground text-sm">Current GPS Location (Optional)</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleLocation}
              disabled={locationLoading || loading}
              className="flex gap-2 items-center text-xs h-9"
            >
              {locationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
              {formData.latitude ? 'Update my location' : 'Use my current location'}
            </Button>
            <span className="text-xs font-medium text-muted-foreground">
              {locationMsg || (formData.latitude ? `Set: ${formData.latitude.toFixed(4)}, ${formData.longitude?.toFixed(4)}` : 'Not set')}
            </span>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={loading || !formData.state || !formData.city}
          className="w-full h-10 text-sm font-bold gap-2 mt-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Location'}
        </Button>
      </CardContent>
    </Card>
  );
}
