"use client";

import React from "react";
import { Bell, Calendar, IndianRupee, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: {
    id: string;
    type: "BOOKING" | "PAYMENT" | "MESSAGE" | "SYSTEM" | "ALERT";
    title: string;
    body: string;
    readAt?: string | Date | null;
    createdAt: string | Date;
  };
  onClick?: () => void;
  className?: string;
}

export function NotificationItem({ notification, onClick, className }: NotificationItemProps) {
  const isUnread = !notification.readAt;

  const getIcon = () => {
    switch (notification.type) {
      case "BOOKING": return <Calendar className="h-4 w-4 text-blue-500" />;
      case "PAYMENT": return <IndianRupee className="h-4 w-4 text-green-500" />;
      case "MESSAGE": return <MessageSquare className="h-4 w-4 text-purple-500" />;
      case "ALERT": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "SYSTEM":
      default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b last:border-0",
        isUnread ? "bg-primary/5" : "bg-transparent",
        className
      )}
    >
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border bg-background shadow-sm",
        isUnread && "border-primary/50 shadow-primary/10"
      )}>
        {getIcon()}
      </div>
      
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium", isUnread && "text-foreground font-semibold")}>
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.body}
        </p>
      </div>
      
      {isUnread && (
        <div className="flex items-center justify-center w-4 shrink-0">
          <div className="h-2 w-2 rounded-full bg-primary" />
        </div>
      )}
    </div>
  );
}
