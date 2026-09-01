"use client";

import React from "react";
import { cn, getMatchScoreColor } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Info } from "lucide-react";

interface MatchScoreProps {
  score: number;
  reasons?: string[];
  breakdown?: {
    skill?: number;
    availability?: number;
    distance?: number;
    reliability?: number;
    certification?: number;
    fairness?: number;
  };
  workerName?: string;
  className?: string;
}

export function MatchScore({ score, reasons, breakdown, workerName = "this worker", className }: MatchScoreProps) {
  const colorClass = getMatchScoreColor(score);
  
  let strokeColor = "#3b82f6";
  if (colorClass.includes("green")) strokeColor = "#22c55e";
  else if (colorClass.includes("yellow")) strokeColor = "#eab308";
  else if (colorClass.includes("orange")) strokeColor = "#f97316";
  else if (colorClass.includes("red")) strokeColor = "#ef4444";

  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const defaultBreakdown = {
    skill: 95,
    availability: 90,
    distance: 85,
    reliability: 92,
    certification: 90,
    fairness: 88,
    ...breakdown,
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative flex items-center justify-center">
        <svg className="h-16 w-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="5"
            fill="transparent"
          />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={strokeColor}
            strokeWidth="5"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className={cn("text-sm font-extrabold", colorClass)}>
            {score}%
          </span>
          <span className="text-[9px] uppercase font-bold text-gray-400">Match</span>
        </div>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-primary hover:text-primary gap-1 px-1">
            <Info className="h-3 w-3" />
            Why this worker?
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Why {workerName}?</SheetTitle>
            <SheetDescription>
              Explainable AI match based on cooperative fairness, location proximity, and verified trade skills.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {reasons && reasons.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs space-y-1">
                <p className="font-bold text-blue-900">Key Recommendation Factors:</p>
                <ul className="list-disc pl-4 text-blue-800 space-y-0.5">
                  {reasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Scoring Breakdown</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Skill Compatibility (35%)</span>
                    <span>{defaultBreakdown.skill}%</span>
                  </div>
                  <Progress value={defaultBreakdown.skill} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Availability (20%)</span>
                    <span>{defaultBreakdown.availability}%</span>
                  </div>
                  <Progress value={defaultBreakdown.availability} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Proximity & Distance (15%)</span>
                    <span>{defaultBreakdown.distance}%</span>
                  </div>
                  <Progress value={defaultBreakdown.distance} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Reliability & Quality (10%)</span>
                    <span>{defaultBreakdown.reliability}%</span>
                  </div>
                  <Progress value={defaultBreakdown.reliability} className="h-1.5" />
                </div>
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span>Cooperative Workload Fairness (10%)</span>
                    <span>{defaultBreakdown.fairness}%</span>
                  </div>
                  <Progress value={defaultBreakdown.fairness} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
