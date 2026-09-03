import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function useRealtimeNotifications(userId: string) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`realtime-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Notification',
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          console.log('New Realtime Notification:', payload);
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);
}
