"use client";

import * as React from "react";
import type { ApexOptions } from "apexcharts";
import { ApexChart } from "@/components/shared/layout/ClientOnly";
import { semanticColors } from "@/lib/theme-colors";

export interface AreaChartProps {
  // Accept data as complex series (multiple lines) or simple number array (for Sparkline)
  series?: { name: string; data: number[] }[];
  data?: number[];
  name?: string; // Name of the data line when passing single data

  categories?: string[];
  colors?: string[];
  height?: number | string;
  width?: number | string;
  sparkline?: boolean;
  strokeWidth?: number | number[];
  dashArray?: number | number[];
  fillType?: string | string[];

  // Formatter for display value (default for both Y-axis and tooltip)
  formatter?: (value: number) => string;
  // Specialized formatter for Y-axis (e.g., shortened to $120k)
  yAxisFormatter?: (value: number) => string;
}

export function AreaChart({
  series,
  data,
  name = "Performance",
  categories,
  colors = [semanticColors.primary, semanticColors.chart2],
  height = "100%",
  width = "100%",
  sparkline = false,
  strokeWidth = 2,
  dashArray = 0,
  fillType = "gradient",
  formatter,
  yAxisFormatter,
}: AreaChartProps) {
  // Normalize input data: automatically wrap single data into series structure
  const chartSeries = React.useMemo(() => {
    if (series) return series;
    if (data) return [{ name, data }];
    return [];
  }, [series, data, name]);

  // Optimize ApexOptions config according to Sparkline or Full Chart variant
  const options: ApexOptions = React.useMemo(() => {
    if (sparkline) {
      return {
        chart: {
          type: "area",
          sparkline: { enabled: true },
          animations: { enabled: false },
          fontFamily: "inherit",
        },
        stroke: {
          curve: "smooth",
          width: strokeWidth as number,
        },
        colors: colors,
        fill: {
          type: "gradient",
          gradient: {
            opacityFrom: 0.4,
            opacityTo: 0,
            stops: [0, 100],
          },
        },
        tooltip: { enabled: false },
      };
    }

    return {
      chart: {
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
        foreColor: semanticColors.mutedForegroundLighter,
      },
      colors: colors,
      stroke: {
        curve: "smooth",
        width: strokeWidth as number | number[],
        dashArray: dashArray as number | number[],
      },
      fill: {
        type: fillType as string | string[],
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0,
          stops: [0, 100],
          colorStops: [],
        },
        opacity: Array.isArray(fillType) ? fillType.map((t) => (t === "solid" ? 0 : 1)) : [1, 0],
      },
      dataLabels: { enabled: false },
      grid: {
        borderColor: semanticColors.border,
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        padding: { left: 8, right: 8, top: 0, bottom: 0 },
      },
      xaxis: {
        categories: categories,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { fontSize: "12px" } },
      },
      yaxis: {
        labels: {
          style: { fontSize: "12px" },
          formatter: yAxisFormatter
            ? (v: number) => yAxisFormatter(v)
            : formatter
              ? (v: number) => formatter(v)
              : undefined,
        },
      },
      tooltip: {
        shared: true,
        y: {
          formatter: formatter ? (v: number) => formatter(v) : undefined,
        },
      },
      legend: { show: false },
      markers: { size: 0, hover: { size: 4 } },
    };
  }, [sparkline, colors, strokeWidth, dashArray, fillType, categories, formatter, yAxisFormatter]);

  return (
    <ApexChart type="area" options={options} series={chartSeries} height={height} width={width} />
  );
}
export default AreaChart;
