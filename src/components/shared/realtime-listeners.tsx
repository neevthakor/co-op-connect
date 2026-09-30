'use client';

import { useRealtimeBookings } from '@/hooks/use-realtime-bookings';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';

export function RealtimeBookingListener({ referenceId, role }: { referenceId: string, role: 'customer' | 'worker' | 'federation' }) {
  useRealtimeBookings(referenceId, role);
  return null;
}

export function RealtimeNotificationListener({ userId }: { userId: string }) {
  useRealtimeNotifications(userId);
  return null;
}

export function RealtimeMessageListener({ userId }: { userId: string }) {
  useRealtimeMessages(userId);
  return null;
}
