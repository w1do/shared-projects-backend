"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  data: number[];
  positive: boolean;
  label?: string;
}

type ChartPoint = {
  x: number;
  y: number;
};

const chartWidth = 96;
const chartHeight = 32;
const chartPadding = 4;

function formatCoordinate(value: number) {
  return Number(value.toFixed(2));
}

function getChartPoints(data: number[]) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  const usableWidth = chartWidth - chartPadding * 2;
  const usableHeight = chartHeight - chartPadding * 2;

  if (data.length === 1) {
    return [{ x: chartWidth / 2, y: chartHeight / 2 }];
  }

  return data.map((value, index) => {
    const x = (index / (data.length - 1)) * usableWidth + chartPadding;
    const normalizedValue = range === 0 ? 0.5 : (value - min) / range;
    const y = chartHeight - normalizedValue * usableHeight - chartPadding;

    return {
      x: formatCoordinate(x),
      y: formatCoordinate(y),
    };
  });
}

function getLinePath(points: ChartPoint[]) {
  if (points.length === 1) {
    const point = points[0];
    return `M ${chartPadding} ${point.y} L ${chartWidth - chartPadding} ${point.y}`;
  }

  return points
    .map((point, index) => {
      const command = index === 0 ? "M" : "L";
      return `${command} ${point.x} ${point.y}`;
    })
    .join(" ");
}

function getAreaPath(points: ChartPoint[], linePath: string) {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const baseline = chartHeight - chartPadding;

  return `${linePath} L ${lastPoint.x} ${baseline} L ${firstPoint.x} ${baseline} Z`;
}

export function Sparkline({ data, positive, label = "Trend over time" }: SparklineProps) {
  const gradientId = React.useId().replace(/:/g, "");

  if (!data || data.length === 0) return null;

  const points = getChartPoints(data);
  const linePath = getLinePath(points);
  const areaPath = getAreaPath(points, linePath);
  const latestPoint = points[points.length - 1];

  const colorClassName = positive ? "text-info" : "text-muted-foreground-lighter";

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className={cn(
        "h-8 w-24 overflow-visible transition-opacity opacity-85 hover:opacity-100",
        colorClassName,
      )}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={latestPoint.x} cy={latestPoint.y} r="2" fill="currentColor" />
    </svg>
  );
}
