"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, type ReactNode } from "react";
import type { ApexOptions } from "apexcharts";
import { preloadApexCharts } from "@/components/ui/charts/apex-charts-loader";

/**
 * Renders children only after client mount to avoid SSR/hydration mismatches.
 * Prefer Next.js `dynamic(..., { ssr: false })` for heavy client-only libs.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

type ChartProps = {
  type: "area" | "line" | "bar" | "donut";
  options: ApexOptions;
  series: ApexOptions["series"];
  height?: number | string;
  width?: number | string;
};

// Use Next.js native dynamic import for React-ApexCharts to solve hydration and dev-double-mount race conditions
export const ApexChart = dynamic(() => preloadApexCharts().then((mod) => mod.default), {
  ssr: false,
  loading: () => <div className="size-full" aria-hidden />,
}) as unknown as React.ComponentType<ChartProps>;
