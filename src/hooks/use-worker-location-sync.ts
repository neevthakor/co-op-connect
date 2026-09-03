'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export function useWorkerLocationSync(workerId: string, isTrackingActive: boolean) {
  const [error, setError] = useState<string | null>(null);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!isTrackingActive) {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    let lastSyncTime = 0;
    const syncThrottleMs = 15000; // Update backend every 15 seconds max

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const now = Date.now();

        if (now - lastSyncTime >= syncThrottleMs) {
          lastSyncTime = now;
          try {
            const res = await fetch(`/api/workers/${workerId}/location`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ latitude, longitude }),
            });
            if (!res.ok) {
              console.error('Failed to sync location to server');
            }
          } catch (err) {
            console.error('Location sync error:', err);
          }
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Location permission denied or unavailable');
        toast.error('Cannot access location for tracking');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [workerId, isTrackingActive]);

  return { error };
}
