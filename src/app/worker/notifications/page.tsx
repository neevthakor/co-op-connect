'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationItem } from '@/components/shared/notification-item';
import { EmptyState } from '@/components/shared/empty-state';
import { CheckCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications');
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-2xl mx-auto w-full">
        <header className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </header>
        <div className="flex flex-col gap-2 mt-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-4 p-4 border-b">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-20 md:p-8 max-w-2xl mx-auto w-full">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Notifications</h1>
          <p className="text-muted-foreground text-sm">Stay updated on your bookings.</p>
        </div>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllAsRead} className="gap-2">
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        )}
      </header>

      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}
