"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, AlertOctagon, Scale } from "lucide-react";
import { formatDateTime, getStatusColor, cn } from "@/lib/utils";

interface Dispute {
  id: string;
  bookingId: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "ESCALATED";
  customerName: string;
  workerName: string;
  createdAt: string | Date;
  customerStatement: string;
  workerResponse?: string;
  resolution?: string;
}

interface DisputeSummaryProps {
  dispute: Dispute;
  onResolve?: (id: string) => void;
  onEscalate?: (id: string) => void;
  className?: string;
}

export function DisputeSummary({ dispute, onResolve, onEscalate, className }: DisputeSummaryProps) {
  return (
    <Card className={cn("border-destructive/30", className)}>
      <CardHeader className="bg-destructive/5 pb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <AlertOctagon className="h-5 w-5 text-destructive" />
            <div>
              <CardTitle className="text-base text-destructive">Dispute #{dispute.id.slice(-6).toUpperCase()}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">Reported on {formatDateTime(new Date(dispute.createdAt))}</p>
            </div>
          </div>
          <Badge className={getStatusColor(dispute.status)}>
            {dispute.status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-4">
        <div className="grid grid-cols-2 text-sm bg-muted/30 p-2 rounded">
          <div>
            <span className="text-muted-foreground text-xs block">Customer</span>
            <span className="font-medium">{dispute.customerName}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-xs block">Worker</span>
            <span className="font-medium">{dispute.workerName}</span>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/50 relative">
            <MessageSquare className="h-4 w-4 absolute top-3 right-3 text-amber-500/50" />
            <p className="font-semibold text-amber-800 dark:text-amber-500 mb-1">Customer Complaint</p>
            <p className="text-amber-900/80 dark:text-amber-200/80 italic">"{dispute.customerStatement}"</p>
          </div>

          {dispute.workerResponse ? (
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/50 relative ml-4">
              <MessageSquare className="h-4 w-4 absolute top-3 right-3 text-blue-500/50" />
              <p className="font-semibold text-blue-800 dark:text-blue-500 mb-1">Worker Response</p>
              <p className="text-blue-900/80 dark:text-blue-200/80 italic">"{dispute.workerResponse}"</p>
            </div>
          ) : (
            <div className="ml-4 p-3 border border-dashed rounded-lg text-muted-foreground text-center text-xs">
              Waiting for worker response...
            </div>
          )}

          {dispute.resolution && (
            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 mt-4">
              <p className="font-semibold text-green-800 dark:text-green-500 mb-1 flex items-center gap-2">
                <Scale className="h-4 w-4" /> Resolution
              </p>
              <p className="text-green-900/80 dark:text-green-200/80">{dispute.resolution}</p>
            </div>
          )}
        </div>
      </CardContent>

      {(dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW') && (onResolve || onEscalate) && (
        <CardFooter className="flex gap-2 justify-end pt-2 border-t bg-muted/20">
          {onEscalate && (
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => onEscalate(dispute.id)}>
              Escalate to Tribunal
            </Button>
          )}
          {onResolve && (
            <Button onClick={() => onResolve(dispute.id)}>
              Propose Resolution
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
