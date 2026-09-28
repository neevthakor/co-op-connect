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
          
          if (payload.eventType === 'UPDATE') {
            const oldStatus = payload.old?.status;
            // Only alert if old status was provided by Postgres Replica Identity and actually changed
            if (oldStatus && payload.new.status !== oldStatus) {
              const status = payload.new.status;
              if (role === 'customer') {
                if (status === 'ACCEPTED') toast.success('Your booking was accepted!');
                else if (status === 'TRAVELLING') toast.info('Worker is on the way!');
                else if (status === 'ARRIVED') toast.info('Worker has arrived!');
                else if (status === 'IN_PROGRESS') toast.info('Booking status changed to In Progress.');
                else if (status === 'COMPLETED') toast.success('Your service was completed!');
              } else if (role === 'worker') {
                if (status === 'REQUESTED') toast.info('New booking request received.');
              }
            }
          } else if (payload.eventType === 'INSERT') {
             if (role === 'worker') toast.info('New booking request received!');
          }
          
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [referenceId, role, router]);
}
