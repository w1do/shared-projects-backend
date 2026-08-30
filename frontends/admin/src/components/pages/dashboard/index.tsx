"use client";

import * as React from "react";
import { DashboardHeader } from "./sections/DashboardHeader";
import { KpiCards } from "./sections/KpiCards";
import { QuickActions } from "./sections/QuickActions";
import { RecentPosts } from "./sections/RecentPosts";
import { RevenueChart } from "./sections/RevenueChart";
import { TopPages } from "./sections/TopPages";
import { useDashboardQuery } from "@/hooks/admin/dashboard";
import { sliceSeriesByTimeRange } from "./utils/time-range";

/**
 * First paint only needs above-the-fold charts ready:
 * KPI sparklines + revenue overview. Brand sparklines sit further down.
 */
export function AdminDashboardClient() {
  const { data } = useDashboardQuery();
  const [timeRange, setTimeRange] = React.useState("Last 30 days");

  // Client-side range filter: proportional tail-slice of chronological series.
  // See ./utils/time-range.ts for fraction mapping (7d/30d/90d/year).
  const kpis = React.useMemo(
    () =>
      (data?.kpis ?? []).map((item) => ({
        ...item,
        spark: sliceSeriesByTimeRange(item.spark, timeRange),
      })),
    [data?.kpis, timeRange],
  );

  const revenueSeries = React.useMemo(
    () => sliceSeriesByTimeRange(data?.revenueSeries ?? [], timeRange),
    [data?.revenueSeries, timeRange],
  );

  return (
    // Раздел отрисован сразу: карточки и графики наполняются по приходе данных
    <div>
      <div className="flex flex-col gap-4">
        <DashboardHeader
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
        />
        <QuickActions timeRange={timeRange} onTimeRangeChange={setTimeRange} />
        <KpiCards items={kpis} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={revenueSeries} rangeLabel={timeRange} />
          </div>
          <TopPages rows={data?.topPages ?? []} />
        </div>
        <RecentPosts posts={data?.recentPosts ?? []} />
      </div>
    </div>
  );
}
