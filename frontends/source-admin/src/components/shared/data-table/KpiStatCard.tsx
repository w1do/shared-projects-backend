"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/charts/chart";
import { Card, CardContent, CardHeader } from "@/components/ui/data-display/card";
import { cn } from "@/lib/utils";

export interface KpiStat {
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  trend?: number[];
  accent?: boolean;
}

export function KpiStatCard({ label, value, delta, icon: Icon, trend, accent }: KpiStat) {
  const rawId = React.useId();
  const gradientId = rawId.replace(/:/g, "");

  const chartConfig = {
    value: {
      label: "Value",
      color: accent ? "var(--color-primary)" : "var(--color-foreground)",
    },
  } satisfies ChartConfig;

  const chartData = (trend ?? []).map((val) => ({
    value: val,
  }));

  return (
    <Card
      className={cn(
        "flex flex-col justify-between shadow-subtle-3 transition-all duration-300 hover:-translate-y-0.5",
        accent ? "border-primary/20 bg-primary/10" : "border-border/60 bg-card",
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
        <span className="text-xs font-medium tracking-tight text-muted-foreground">{label}</span>
        <div
          className={cn(
            "flex size-12 items-center justify-center rounded-full bg-muted",
            accent ? "bg-primary/20 text-foreground" : "text-foreground",
          )}
        >
          <Icon className="size-6 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent className="mt-4 flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </span>
          {delta && (
            <span
              className={cn(
                "text-xs font-medium tracking-normal",
                accent ? "font-semibold text-primary" : "text-success",
              )}
            >
              {delta}
            </span>
          )}
        </div>

        {chartData.length > 0 && (
          <div className="h-10 w-32 overflow-hidden">
            <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
              <AreaChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <defs>
                  <linearGradient id={`kpi-gradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-value)" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="var(--color-value)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--color-value)"
                  strokeWidth={1.5}
                  fill={`url(#kpi-gradient-${gradientId})`}
                  dot={false}
                  activeDot={false}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
