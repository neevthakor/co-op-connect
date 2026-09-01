import React from "react";
import { cn, formatDate, getStatusColor } from "@/lib/utils";

interface TimelineEvent {
  status: string;
  createdAt: string | Date;
  note?: string | null;
}

interface BookingTimelineProps {
  statusHistory?: TimelineEvent[] | any[];
  status?: string;
  className?: string;
}

export function BookingTimeline({ statusHistory, status, className }: BookingTimelineProps) {
  const events = statusHistory && statusHistory.length > 0 
    ? statusHistory 
    : status 
    ? [{ status, createdAt: new Date(), note: "Current Status" }] 
    : [];

  if (events.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const colorClass = getStatusColor(event.status);
        
        let dotColor = "bg-primary";
        if (colorClass.includes("yellow")) dotColor = "bg-amber-500";
        if (colorClass.includes("blue")) dotColor = "bg-blue-500";
        if (colorClass.includes("green")) dotColor = "bg-green-600";
        if (colorClass.includes("red")) dotColor = "bg-red-500";
        if (colorClass.includes("slate") || colorClass.includes("gray")) dotColor = "bg-gray-400";

        return (
          <div key={`${event.status}-${index}`} className="relative flex gap-3">
            {!isLast && (
              <div className="absolute left-2.5 top-4 bottom-[-0.75rem] w-0.5 bg-gray-200" />
            )}
            <div className="relative mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
              <div className={cn("h-2.5 w-2.5 rounded-full ring-4 ring-white", dotColor)} />
            </div>
            <div className="flex flex-col pb-3">
              <span className="font-bold text-xs text-gray-900">
                {event.status.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] text-gray-400">
                {formatDate(new Date(event.createdAt))}
              </span>
              {event.note && (
                <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded-md border text-[11px]">
                  {event.note}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
