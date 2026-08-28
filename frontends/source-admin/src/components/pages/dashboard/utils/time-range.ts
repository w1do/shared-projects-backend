/**
 * Dashboard time-range filtering for chart series.
 *
 * Behavior (client-side, no API re-fetch):
 * - Series arrays are treated as evenly spaced chronological points, oldest → newest.
 * - The selected range is mapped to a fraction of the full window (assumed 90 days).
 * - We keep a proportional tail from the end of the array (at least 1 point).
 * - This applies to revenue weekly points, KPI sparkline arrays, and brand trend arrays.
 * - Aggregate list widgets (campaigns, categories, recent orders) are not re-queried;
 *   only their sparkline/series fields are sliced when present.
 */
import { t } from "@/lib/admin/console-texts";

export const DASHBOARD_TIME_RANGES = [
  "Last 7 days",
  "Last 30 days",
  "Last 90 days",
  "This year",
] as const;

export type DashboardTimeRange = (typeof DASHBOARD_TIME_RANGES)[number];

/** Fraction of a 90-day baseline window represented by each preset. */
const RANGE_FRACTION: Record<DashboardTimeRange, number> = {
  "Last 7 days": 7 / 90,
  "Last 30 days": 30 / 90,
  "Last 90 days": 1,
  "This year": 1,
};

export function isDashboardTimeRange(
  value: string,
): value is DashboardTimeRange {
  return (DASHBOARD_TIME_RANGES as readonly string[]).includes(value);
}

/**
 * Подпись пресета для интерфейса. Внутренние значения состояния остаются
 * английскими константами (`RANGE_FRACTION` ключуется ими) — переводится
 * только отображение.
 */
export function timeRangeLabel(value: string): string {
  if (value === "Last 7 days") return t("console.dashboard.range-7d");
  if (value === "Last 30 days") return t("console.dashboard.range-30d");
  if (value === "Last 90 days") return t("console.dashboard.range-90d");
  if (value === "This year") return t("console.dashboard.range-year");
  return value;
}

/**
 * Slice a chronological series to the selected range by proportional tail sampling.
 * Example: 12 weekly points + "Last 30 days" → last 4 points (round(12 * 30/90)).
 */
export function sliceSeriesByTimeRange<T>(series: T[], timeRange: string): T[] {
  if (series.length === 0) return series;
  const fraction = isDashboardTimeRange(timeRange)
    ? RANGE_FRACTION[timeRange]
    : 1;
  const count = Math.max(1, Math.round(series.length * fraction));
  return series.slice(-count);
}

/** Multiplier used when scaling absolute metrics to match the selected range. */
export function timeRangeScale(timeRange: string): number {
  if (!isDashboardTimeRange(timeRange)) return 1;
  return RANGE_FRACTION[timeRange];
}
