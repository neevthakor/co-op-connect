import React from "react";
import { AlertCircle, ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SkillGapProps {
  gap: {
    category: string;
    area: string;
    expectedDemand: number;
    availableWorkers: number;
    gap: number;
    recommendation: string;
  };
  className?: string;
}

export function SkillGapCard({ gap, className }: SkillGapProps) {
  const isSevere = gap.gap > gap.availableWorkers * 0.5;

  return (
    <div className={cn(
      "rounded-lg border p-4 shadow-sm",
      isSevere ? "bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-900" 
               : "bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900",
      className
    )}>
      <div className="flex gap-4">
        <div className={cn(
          "shrink-0 mt-1",
          isSevere ? "text-red-500" : "text-amber-500"
        )}>
          <AlertCircle className="h-5 w-5" />
        </div>
        
        <div className="flex-1 space-y-2">
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2">
              Skill Shortage: {gap.category}
              <span className="text-xs font-normal text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                {gap.area}
              </span>
            </h4>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-sm py-2">
            <div className="bg-background/60 rounded p-2">
              <div className="text-muted-foreground text-xs">Demand</div>
              <div className="font-semibold">{gap.expectedDemand}</div>
            </div>
            <div className="bg-background/60 rounded p-2">
              <div className="text-muted-foreground text-xs">Supply</div>
              <div className="font-semibold">{gap.availableWorkers}</div>
            </div>
            <div className="bg-background/60 rounded p-2">
              <div className="text-muted-foreground text-xs">Shortfall</div>
              <div className={cn("font-bold", isSevere ? "text-red-600" : "text-amber-600")}>
                -{gap.gap}
              </div>
            </div>
          </div>
          
          <div className="text-sm pt-2 border-t border-black/5 dark:border-white/5">
            <strong>Action Needed:</strong> {gap.recommendation}
          </div>
          
          <div className="flex justify-end pt-2 gap-2">
            <Button variant="outline" size="sm" className="bg-background/50">
              <UserPlus className="h-3 w-3 mr-2" /> Broadcast Alert
            </Button>
            <Button size="sm" className={isSevere ? "bg-red-600 hover:bg-red-700 text-white" : ""}>
              Cross-Train <ArrowRight className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
