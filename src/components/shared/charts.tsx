"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart as RechartsLineChart,
  Line,
} from "recharts";

interface ChartProps {
  data?: any[];
  className?: string;
}

export function BarChart({ data, className }: ChartProps) {
  const defaultData = [
    { name: "Mon", bookings: 12 },
    { name: "Tue", bookings: 19 },
    { name: "Wed", bookings: 15 },
    { name: "Thu", bookings: 22 },
    { name: "Fri", bookings: 28 },
    { name: "Sat", bookings: 34 },
    { name: "Sun", bookings: 25 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className={className || "h-64 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="name" fontSize={12} stroke="#64748B" tickLine={false} />
          <YAxis fontSize={12} stroke="#64748B" tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E2E8F0" }}
          />
          <Bar dataKey="bookings" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LineChart({ data, className }: ChartProps) {
  const defaultData = [
    { name: "Jan", revenue: 45000 },
    { name: "Feb", revenue: 52000 },
    { name: "Mar", revenue: 61000 },
    { name: "Apr", revenue: 58000 },
    { name: "May", revenue: 74000 },
    { name: "Jun", revenue: 89000 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className={className || "h-64 w-full"}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="name" fontSize={12} stroke="#64748B" tickLine={false} />
          <YAxis fontSize={12} stroke="#64748B" tickLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: "#FFFFFF", borderRadius: "8px", border: "1px solid #E2E8F0" }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#10B981"
            strokeWidth={2}
            dot={{ r: 4, fill: "#10B981" }}
            activeDot={{ r: 6 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
