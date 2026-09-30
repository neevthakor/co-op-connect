import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useRealtimeBookings(referenceId: string, role: 'customer' | 'worker' | 'federation') {
  const router = useRouter();

  useEffect(() => {
    if (!referenceId || role === 'federation') return; // Federation cannot safely subscribe to all bookings without exposing unrelated data

    let filterString = '';
    if (role === 'customer') filterString = `customerId=eq.${referenceId}`;
    if (role === 'worker') filterString = `workerId=eq.${referenceId}`;

    const channel = supabase
      .channel(`realtime-bookings-${referenceId}-${role}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'Booking',
          ...(filterString ? { filter: filterString } : {}),
        },
        (payload: any) => {
          console.log('Realtime Booking Update:', payload);
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [referenceId, role, router]);
}
