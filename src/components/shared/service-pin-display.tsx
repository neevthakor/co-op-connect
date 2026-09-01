import React from "react";
import { cn } from "@/lib/utils";

interface ServicePinDisplayProps {
  pin: string;
  label?: string;
  className?: string;
}

export function ServicePinDisplay({ pin, label = "YOUR SERVICE PIN", className }: ServicePinDisplayProps) {
  // Ensure pin is always 4 characters for display, pad with zeros if needed
  const displayPin = (pin || "").padEnd(4, " ").substring(0, 4).split("");

  return (
    <div className={cn("flex flex-col items-center justify-center p-6 bg-muted/30 rounded-xl border border-dashed", className)}>
      <p className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">{label}</p>
      <div className="flex gap-3 sm:gap-4">
        {displayPin.map((digit, idx) => (
          <div 
            key={idx}
            className="w-12 h-16 sm:w-16 sm:h-20 bg-background border-2 border-primary/20 rounded-lg flex items-center justify-center shadow-sm"
          >
            <span className="text-3xl sm:text-4xl font-bold font-mono text-primary">
              {digit}
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4 max-w-xs text-center">
        Share this PIN with the worker when they arrive to start the job securely.
      </p>
    </div>
  );
}
