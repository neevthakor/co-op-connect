import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldPlus, Heart, Umbrella, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { formatCurrency, cn } from "@/lib/utils";

interface WelfareMetrics {
  totalFund: number;
  activeClaims: number;
  insuranceCoverage: number; // percentage
  healthCheckups: number; // count
}

interface WelfareCardProps {
  metrics: WelfareMetrics;
  className?: string;
}

export function WelfareCard({ metrics, className }: WelfareCardProps) {
  return (
    <Card className={cn("bg-primary/5 border-primary/20", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2 text-primary">
          <ShieldPlus className="h-5 w-5" />
          Worker Welfare Program
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="bg-background rounded-lg p-3 border shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Fund Pool</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.totalFund)}</p>
          </div>
          <div className="bg-background rounded-lg p-3 border shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">Active Claims</p>
            <p className="text-xl font-bold">{metrics.activeClaims}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><Umbrella className="h-4 w-4 text-blue-500" /> Insured Workers</span>
              <span className="font-medium">{metrics.insuranceCoverage}%</span>
            </div>
            <Progress value={metrics.insuranceCoverage} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2"><Activity className="h-4 w-4 text-rose-500" /> Health Checkups Completed</span>
              <span className="font-medium">{metrics.healthCheckups}</span>
            </div>
            <Progress value={Math.min(100, (metrics.healthCheckups / 1000) * 100)} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
