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
    <Card className={cn("overflow-hidden border-primary/20 bg-white", className)}>
      <CardHeader className="bg-blue-50/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-primary">Transparent Price Estimate</CardTitle>
          <div className="flex items-center gap-1 text-gray-500 text-[11px] font-medium bg-white px-2 py-0.5 rounded border">
            <AlertCircle className="h-3 w-3 text-amber-500" />
            AI ESTIMATE
          </div>
        </div>
        <div className="text-2xl font-extrabold text-gray-900 mt-2 flex items-baseline gap-1">
          {formatCurrency(min)} <span className="text-lg text-gray-400 font-normal mx-1">–</span> {formatCurrency(max)}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Cost Breakdown</h4>
        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-gray-700">
            <span>Estimated Labour Charge</span>
            <span className="font-semibold text-gray-900">{formatCurrency(labour)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-700">
            <span>Travel Allowance (Worker Transport)</span>
            <span className="font-semibold text-gray-900">{formatCurrency(travel)}</span>
          </div>
          {materials > 0 && (
            <div className="flex justify-between items-center text-gray-700">
              <span>Estimated Consumables & Tax</span>
              <span className="font-semibold text-gray-900">{formatCurrency(materials)}</span>
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-dashed">
          <p className="text-[11px] text-gray-500">
            Final price requires your confirmation after on-site diagnostic. Any extra material charges must be approved by you directly in the app.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
