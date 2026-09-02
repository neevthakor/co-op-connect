import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface PriceEstimateProps {
  estimate?: {
    min?: number;
    max?: number;
    basePrice?: number;
    taxes?: number;
    platformFee?: number;
    total?: number;
    breakdown?: {
      labour?: number;
      travel?: number;
      materials?: number;
    };
  };
  basePrice?: number;
  taxes?: number;
  platformFee?: number;
  total?: number;
  className?: string;
}

export function PriceEstimate(props: PriceEstimateProps) {
  const { estimate, className } = props;
  
  const min = estimate?.min || props.basePrice || 350;
  const max = estimate?.max || props.total || (min * 1.25);
  const labour = estimate?.breakdown?.labour || props.basePrice || Math.round(min * 0.75);
  const travel = estimate?.breakdown?.travel || props.platformFee || 50;
  const materials = estimate?.breakdown?.materials || props.taxes || 0;

  return (
    <Card className={cn("overflow-hidden border-primary/30 bg-card", className)}>
      <CardHeader className="bg-primary/10 border-b border-border/80 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-primary">Transparent Price Estimate</CardTitle>
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold bg-secondary/80 px-2.5 py-0.5 rounded-full border border-border/60">
            <AlertCircle className="h-3 w-3 text-amber-400" />
            AI ESTIMATE
          </div>
        </div>
        <div className="text-2xl font-black text-foreground mt-2 flex items-baseline gap-1">
          {formatCurrency(min)} <span className="text-lg text-muted-foreground font-normal mx-1">–</span> {formatCurrency(max)}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Cost Breakdown</h4>
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Estimated Labour Charge</span>
            <span className="font-semibold text-foreground">{formatCurrency(labour)}</span>
          </div>
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Travel Allowance (Worker Transport)</span>
            <span className="font-semibold text-foreground">{formatCurrency(travel)}</span>
          </div>
          {materials > 0 && (
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Estimated Consumables & Tax</span>
              <span className="font-semibold text-foreground">{formatCurrency(materials)}</span>
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-border/60 border-dashed">
          <p className="text-[11px] text-muted-foreground">
            Final price requires your confirmation after on-site diagnostic. Any extra material charges must be approved by you directly in the app.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
