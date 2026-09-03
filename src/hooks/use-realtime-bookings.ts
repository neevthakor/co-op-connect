import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function useRealtimeBookings(userId: string, role: 'customer' | 'worker') {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const filterColumn = role === 'customer' ? 'customerId' : 'workerId';

    const channel = supabase
      .channel(`realtime-bookings-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Booking',
          filter: `${filterColumn}=eq.${userId}`,
        },
        (payload) => {
          console.log('Realtime Booking Update:', payload);
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, role, router]);
}
