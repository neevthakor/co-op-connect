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
    <Link href={targetHref} className="block h-full">
      <Card className={cn("h-full transition-all hover:border-primary/40 hover:shadow-md bg-white border flex flex-col", className)}>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 p-4 pb-2">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs bg-gray-50">{categoryName}</Badge>
              <span className="text-[11px] font-mono text-gray-400">#{booking.id}</span>
            </div>
            <h4 className="font-bold text-gray-900 text-sm line-clamp-1">{description}</h4>
          </div>
          <Badge className={cn("shrink-0 text-xs font-semibold", getStatusColor(booking.status))}>
            {booking.status.replace(/_/g, ' ')}
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2 text-xs text-gray-500 flex-1 flex flex-col justify-end space-y-1.5">
          {workerName && (
            <div className="flex items-center gap-1.5 text-gray-700">
              <User className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-medium truncate">{workerName}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-gray-500">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>{formatDate(date)}</span>
          </div>
          <div className="flex items-center justify-between font-bold text-gray-900 pt-2 border-t mt-1">
            <span className="text-[11px] text-gray-500 font-normal">Amount:</span>
            <span className="text-sm text-primary font-bold">{formatCurrency(price)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
