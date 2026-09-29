'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, PhoneCall, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SOSButtonProps {
  bookingId?: string;
  className?: string;
  coopSafetyPhone?: string | null;
}

export function SOSButton({ bookingId, className, coopSafetyPhone }: SOSButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSOS = async (type: 'POLICE' | 'SAFETY_CALL' | 'SAFETY_TEAM' | 'REPORT') => {
    if (type === 'POLICE') {
      window.location.href = 'tel:112'; // Default emergency number in India
      return;
    }
    
    if (type === 'SAFETY_CALL') {
      setLoading(true);
      try {
        let lat: number | undefined;
        let lng: number | undefined;
        try {
          if (navigator.geolocation) {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          }
        } catch (e) {
          console.warn('Could not get location for SOS');
        }

        // Fire alert in background (non-blocking) before calling
        fetch('/api/sos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId,
            latitude: lat,
            longitude: lng,
            description: 'Emergency assistance requested via call',
          }),
        }).catch(e => console.error('Failed to log SOS', e));

        const phone = coopSafetyPhone || process.env.NEXT_PUBLIC_COOP_SAFETY_PHONE || '9316154023';
        window.location.href = `tel:${phone}`;
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className={`rounded-full font-bold shadow-lg flex items-center gap-2 ${className || ''}`}
      >
        <AlertCircle className="w-5 h-5" />
        SOS
      </Button>
    );
  }

  return (
    <div className={`bg-red-50 border-2 border-red-500 rounded-lg p-4 shadow-xl ${className || ''}`}>
      <h3 className="font-bold text-red-800 flex items-center gap-2 mb-3">
        <ShieldAlert className="w-5 h-5" /> Emergency Options
      </h3>
      <p className="text-xs text-red-700 mb-4">
        If you are in immediate danger, contact emergency services.
      </p>
      <div className="space-y-2">
        <Button
          variant="destructive"
          className="w-full flex justify-start gap-3"
          onClick={() => handleSOS('POLICE')}
        >
          <PhoneCall className="w-4 h-4" /> Call Police (112)
        </Button>
        <Button
          variant="secondary"
          className="w-full flex justify-start gap-3 border-orange-200 hover:bg-orange-100 text-orange-800"
          onClick={() => handleSOS('SAFETY_CALL')}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PhoneCall className="w-4 h-4" />}
          Call Co-opConnect Safety
        </Button>
        <Button
          variant="ghost"
          className="w-full text-muted-foreground mt-2"
          onClick={() => setIsOpen(false)}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
