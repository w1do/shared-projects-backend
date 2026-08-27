"use client";

import * as React from "react";
import { DashboardHeader } from "./sections/DashboardHeader";
import { KpiCards } from "./sections/KpiCards";
import { QuickActions } from "./sections/QuickActions";
import { RecentPosts } from "./sections/RecentPosts";
import { RevenueChart } from "./sections/RevenueChart";
import { TopPages } from "./sections/TopPages";
import { DashboardLoadingState } from "./loading";
import { useDashboardQuery } from "@/hooks/admin/dashboard";
import { useApexChartsPainted } from "@/hooks/use-apex-charts-painted";
import { sliceSeriesByTimeRange } from "./utils/time-range";

/**
 * First paint only needs above-the-fold charts ready:
 * KPI sparklines + revenue overview. Brand sparklines sit further down.
 */
function aboveFoldChartCount(kpiCount: number) {
  return kpiCount + 1;
}

export function AdminDashboardClient() {
  const { data, isPending } = useDashboardQuery();
  const [timeRange, setTimeRange] = React.useState("Last 30 days");
  const contentRef = React.useRef<HTMLDivElement>(null);

  const dataReady = !isPending && !!data;
  const chartTarget = dataReady ? aboveFoldChartCount(data.kpis.length) : 0;

  // Mount real dashboard under the skeleton overlay; only lift the overlay once
  // Apex has painted enough canvases so charts never "pop in" after content.
  const chartsPainted = useApexChartsPainted(contentRef, {
    enabled: dataReady,
    minCount: Math.max(chartTarget, 1),
  });

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

  // Query still in-flight — only skeleton (no chart mount yet).
  if (!dataReady || !data) {
    return <DashboardLoadingState />;
  }

  const showSkeleton = !chartsPainted;

  return (
    <div className="relative">
      {/*
        Real dashboard mounts and Apex paints underneath a solid skeleton cover.
        Charts are already drawn when the cover lifts — no empty→chart pop-in.
      */}
      <div
        ref={contentRef}
        className="flex flex-col gap-4"
        aria-hidden={showSkeleton}
      >
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
          <TopPages rows={data.topPages} />
        </div>
        <RecentPosts posts={data.recentPosts} />
      </div>

      {showSkeleton ? (
        <div
          className="absolute inset-0 z-10 overflow-hidden bg-background"
          aria-busy="true"
          aria-live="polite"
        >
          <DashboardLoadingState />
        </div>
      ) : null}
    </div>
  );
}
