"use client";

import React from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface TrendChartProps {
  performanceTrend: number[];
}

export function TrendChart({ performanceTrend }: TrendChartProps) {
  const data = performanceTrend.map((v, i) => ({ Month: `M${i + 1}`, Value: v }));

  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption text-muted-foreground uppercase tracking-wider font-semibold">
        Performance Trend (12 Months)
      </span>
      <div className="h-40 w-full border border-border/40 p-4 rounded-2xl bg-card">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: -4 }}>
            <defs>
              <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="Month"
              stroke="var(--color-muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--color-muted-foreground)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="Value"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#detailGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
