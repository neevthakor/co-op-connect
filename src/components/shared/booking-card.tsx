import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatDateTime, formatDate, getStatusColor } from "@/lib/utils";
import { Calendar, User, IndianRupee, MapPin } from "lucide-react";

export function BookingCard({ booking, href, className }: { booking: any; href?: string; className?: string }) {
  const categoryName = booking.category?.name || booking.category || "Service";
  const workerName = booking.worker?.user?.name || booking.worker?.name || booking.worker;
  const description = booking.description || `${categoryName} Request`;
  const date = booking.scheduledDate || booking.createdAt || new Date();
  const price = booking.finalPrice || booking.estimatedPrice || booking.category?.basePrice || 350;
  const targetHref = href || `/customer/bookings/${booking.id}`;

  return (
    <Link href={targetHref} className="block h-full group">
      <Card className={cn("h-full transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 bg-card border-border/80 flex flex-col", className)}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-4 pb-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-secondary/70 border-border text-foreground">{categoryName}</Badge>
              <span className="text-[11px] font-mono text-muted-foreground/70">#{booking.id}</span>
            </div>
            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-sm line-clamp-1">{description}</h4>
          </div>
          <Badge className={cn("shrink-0 text-xs font-semibold", getStatusColor(booking.status))}>
            {booking.status.replace(/_/g, ' ')}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2 text-xs text-muted-foreground flex-1 flex flex-col justify-end space-y-1.5">
          {workerName && (
            <div className="flex items-center gap-1.5 text-foreground/90">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium truncate">{workerName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center justify-between font-bold text-foreground pt-2 border-t border-border mt-1">
            <span className="text-[11px] text-muted-foreground font-normal">Amount:</span>
            <span className="text-sm text-primary font-bold">{formatCurrency(price)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
