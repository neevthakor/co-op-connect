'use client';

import { useRealtimeBookings } from '@/hooks/use-realtime-bookings';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';
import { useRealtimeMessages } from '@/hooks/use-realtime-messages';

export function RealtimeBookingListener({ userId, role }: { userId: string, role: 'customer' | 'worker' }) {
  useRealtimeBookings(userId, role);
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
