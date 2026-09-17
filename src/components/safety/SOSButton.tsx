'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, PhoneCall, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SOSButtonProps {
  bookingId?: string;
  className?: string;
}

export function SOSButton({ bookingId, className }: SOSButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSOS = async (type: 'POLICE' | 'SAFETY_TEAM' | 'REPORT') => {
    if (type === 'POLICE') {
      window.location.href = 'tel:112'; // Default emergency number in India
      return;
    }

    setLoading(true);
    try {
      // Get location if possible
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

      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          latitude: lat,
          longitude: lng,
          description: type === 'SAFETY_TEAM' ? 'Emergency assistance requested' : 'Safety report filed',
        }),
      });

      if (!res.ok) throw new Error('Failed to trigger SOS');

      toast.error(
        type === 'SAFETY_TEAM'
          ? 'Safety Team has been alerted. They will contact you immediately.'
          : 'Incident reported successfully.',
        {
          duration: 10000,
          icon: <ShieldAlert className="w-5 h-5 text-red-500" />,
        }
      );
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to trigger alert. Please call 112 directly.');
    } finally {
      setLoading(false);
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
          variant="outline"
          className="w-full flex justify-start gap-3 border-red-200 hover:bg-red-100 text-red-800"
          onClick={() => handleSOS('SAFETY_TEAM')}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
          Alert Co-opConnect Safety Team
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
