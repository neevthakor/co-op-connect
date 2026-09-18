'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface AvailabilityToggleProps {
  workerId: string;
  initialStatus: string;
}

export function AvailabilityToggle({ workerId, initialStatus }: AvailabilityToggleProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isUpdating, setIsUpdating] = useState(false);

  const isBusy = status === 'BUSY';
  
  const handleToggle = async (checked: boolean) => {
    const newStatus = checked ? 'AVAILABLE' : 'OFFLINE';
    
    setIsUpdating(true);
    const toastId = toast.loading('Updating availability...');
    
    try {
      const res = await fetch(`/api/workers/${workerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availabilityStatus: newStatus }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update status');
      }
      
      setStatus(newStatus);
      toast.success(
        checked ? 'You are now online and available for jobs.' : 'You are now offline.', 
        { id: toastId }
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status', { id: toastId });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isBusy) {
    return (
      <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl">
        <div className="flex flex-col items-end">
          <span className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            BUSY
          </span>
          <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80">Currently on a job</span>
        </div>
        <Switch 
          checked={true} 
          disabled={true} 
          className="data-[state=checked]:bg-blue-500" 
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-3 py-2 rounded-xl border transition-colors ${
      status === 'AVAILABLE' 
        ? 'bg-emerald-500/10 border-emerald-500/20' 
        : 'bg-muted/50 border-border'
    }`}>
      <div className="flex flex-col items-end">
        <span className={`text-xs font-bold flex items-center gap-1.5 ${
          status === 'AVAILABLE' ? 'text-emerald-700 dark:text-emerald-400' : 'text-muted-foreground'
        }`}>
          {status === 'AVAILABLE' ? '🟢 ONLINE' : '⚫ OFFLINE'}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {status === 'AVAILABLE' ? 'Available for new bookings' : 'Not available for new bookings'}
        </span>
      </div>
      <Switch 
        checked={status === 'AVAILABLE'} 
        onCheckedChange={handleToggle}
        disabled={isUpdating}
        className="data-[state=checked]:bg-emerald-500"
      />
    </div>
  );
}
