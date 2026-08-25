"use client";

import { useState, useMemo } from "react";
import { AreaChart } from "@/components/ui/charts/area-chart";
import { ButtonGroup } from "@/components/ui/inputs/button-group";
import {
  tabs,
  calculateTotals,
  formatTotalValue,
  METRIC_KEYS,
  CHART_FORMATTERS,
  type ChartDataPoint,
} from "./helpers";

type RevenueChartProps = {
  data: ChartDataPoint[];
  /** Human-readable range label shown in the chart subtitle. */
  rangeLabel?: string;
};

export function RevenueChart({ data, rangeLabel = "Selected range" }: RevenueChartProps) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Revenue");
  const categoriesX = data.map((d) => d.week);

  const totals = useMemo(() => calculateTotals(data), [data]);

  const currentTotal = formatTotalValue(totals[active].current, active);
  const priorTotal = formatTotalValue(totals[active].prior, active);

  const chartSeries = useMemo(() => {
    const keys = METRIC_KEYS[active];
    return [
      { name: "Current", data: data.map((d) => d[keys.current] ?? 0) },
      { name: "Previous", data: data.map((d) => d[keys.previous] ?? 0) },
    ];
  }, [data, active]);

  const formatters = CHART_FORMATTERS[active];

  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-openrunde text-heading leading-tight text-foreground">
            Revenue overview
          </h3>
          <p className="mt-2 text-xs text-muted-foreground">
            {rangeLabel} · trailing performance vs. prior period
          </p>
        </div>
        <ButtonGroup options={tabs} value={active} onChange={setActive} size="sm" />
      </div>
      <div className="mt-6 flex flex-wrap items-end gap-8">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground-lighter">
            This period
          </div>
          <div className="font-openrunde text-heading-lg leading-none text-foreground">
            {currentTotal}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground-lighter">
            Prior period
          </div>
          <div className="font-openrunde text-heading leading-none text-muted-foreground">
            {priorTotal}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Current
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ring" />
            Previous
          </span>
        </div>
      </div>
      <div className="mt-6 w-full">
        <AreaChart
          series={chartSeries}
          categories={categoriesX}
          colors={["var(--color-primary)", "var(--color-ring)"]}
          strokeWidth={[2.5, 1.5]}
          dashArray={[0, 4]}
          fillType={["gradient", "solid"]}
          formatter={formatters.formatter}
          yAxisFormatter={formatters.yAxisFormatter}
          height={280}
        />
      </div>
    </div>
  );
}
