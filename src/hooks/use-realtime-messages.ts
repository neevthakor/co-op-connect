import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function useRealtimeMessages(userId: string) {
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`realtime-messages-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Message',
          filter: `recipientId=eq.${userId}`,
        },
        (payload) => {
          console.log('New Realtime Message:', payload);
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router]);
}
