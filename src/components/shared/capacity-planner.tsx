"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface CapacityData {
  category: string;
  demand: number;
  supply: number;
  gap: number; // demand - supply
}

interface CapacityPlannerProps {
  data: CapacityData[];
  className?: string;
}

export function CapacityPlanner({ data, className }: CapacityPlannerProps) {
  // Sort to show biggest gaps first
  const sortedData = [...data].sort((a, b) => b.gap - a.gap);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Capacity Planner
          <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-1 rounded-full ml-auto">
            Real-time
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" />
              <YAxis dataKey="category" type="category" width={100} tick={{fontSize: 12}} />
              <Tooltip
                contentStyle={{ borderRadius: "8px" }}
                cursor={{fill: 'rgba(0, 0, 0, 0.05)'}}
              />
              <Legend />
              <Bar dataKey="demand" name="Expected Demand" fill="#0ea5e9" radius={[0, 4, 4, 0]} barSize={12} />
              <Bar dataKey="supply" name="Available Supply" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {sortedData.length > 0 && sortedData[0].gap > 0 && (
          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-amber-800 dark:text-amber-400">Critical Shortage Alert</p>
              <p className="text-amber-700/80 dark:text-amber-500/80 mt-1">
                {sortedData[0].category} is facing a severe shortage of {sortedData[0].gap} workers. Consider mobilizing from nearby areas or activating standby pool.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
