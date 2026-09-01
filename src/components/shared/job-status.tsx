import React from "react";
import { Badge } from "@/components/ui/badge";
import { getStatusColor, cn } from "@/lib/utils";

interface JobStatusProps {
  status: string;
  className?: string;
}

export function JobStatus({ status, className }: JobStatusProps) {
  return (
    <Badge className={cn("px-2.5 py-0.5 font-semibold", getStatusColor(status), className)}>
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
