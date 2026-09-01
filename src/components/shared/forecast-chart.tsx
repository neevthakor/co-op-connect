"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from "recharts";
import { cn } from "@/lib/utils";

interface ForecastData {
  date: string;
  actual?: number;
  forecast: number;
  confidenceMin?: number;
  confidenceMax?: number;
}

interface ForecastChartProps {
  data: ForecastData[];
  title?: string;
  className?: string;
}

export function ForecastChart({ data, title = "Demand Forecast", className }: ForecastChartProps) {
  return (
    <Card className={cn("w-full", className)}>
      {title && (
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                dy={10}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                labelStyle={{ fontWeight: "bold", color: "#374151" }}
              />
              
              {/* Confidence interval area */}
              {data[0]?.confidenceMin !== undefined && (
                <Area 
                  type="monotone" 
                  dataKey="confidenceMax" 
                  stroke="none" 
                  fill="#818cf8" 
                  fillOpacity={0.2} 
                />
              )}
              {data[0]?.confidenceMin !== undefined && (
                <Area 
                  type="monotone" 
                  dataKey="confidenceMin" 
                  stroke="none" 
                  fill="#ffffff" 
                  fillOpacity={1} 
                />
              )}
              
              {/* Forecast line */}
              <Line 
                type="monotone" 
                dataKey="forecast" 
                stroke="#6366f1" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Forecast"
              />
              
              {/* Actual data line */}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
                name="Actual"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-sky-500"></span> Actual Demand
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-indigo-500 border-t border-dashed"></span> Forecast
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
