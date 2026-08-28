import { t } from "@/lib/admin/console-texts";

export const tabs = ["Revenue", "Orders", "AOV"] as const;
export type TabType = (typeof tabs)[number];

/** Подписи вкладок; внутренние значения остаются ключами METRIC_KEYS/CHART_FORMATTERS. */
export function tabLabel(tab: TabType): string {
  if (tab === "Revenue") return t("console.dashboard.tab-revenue");
  if (tab === "Orders") return t("console.dashboard.tab-orders");
  return t("console.dashboard.tab-aov");
}

export const METRIC_KEYS = {
  Revenue: { current: "revenue", previous: "prev" },
  Orders: { current: "orders", previous: "ordersPrev" },
  AOV: { current: "aov", previous: "aovPrev" },
} as const;

export const CHART_FORMATTERS = {
  Revenue: {
    formatter: (v: number) => `$${v.toLocaleString()}`,
    yAxisFormatter: (v: number) => `$${(v / 1000).toFixed(0)}k`,
  },
  Orders: {
    formatter: (v: number) => v.toLocaleString(),
    yAxisFormatter: (v: number) => v.toFixed(0),
  },
  AOV: {
    formatter: (v: number) => `$${v.toFixed(2)}`,
    yAxisFormatter: (v: number) => `$${v.toFixed(0)}`,
  },
} as const;

export type ChartDataPoint = {
  week: string;
  revenue: number;
  prev: number;
  orders?: number;
  ordersPrev?: number;
  aov?: number;
  aovPrev?: number;
};

export function calculateTotals(data: ChartDataPoint[]) {
  let revenue = 0;
  let prevRevenue = 0;
  let orders = 0;
  let prevOrders = 0;

  for (const point of data) {
    revenue += point.revenue;
    prevRevenue += point.prev;
    orders += point.orders ?? 0;
    prevOrders += point.ordersPrev ?? 0;
  }

  const aov = orders > 0 ? revenue / orders : 0;
  const prevAov = prevOrders > 0 ? prevRevenue / prevOrders : 0;

  return {
    Revenue: { current: revenue, prior: prevRevenue },
    Orders: { current: orders, prior: prevOrders },
    AOV: { current: aov, prior: prevAov },
  };
}

export function formatTotalValue(val: number, type: TabType) {
  if (type === "Orders") return val.toLocaleString();
  if (type === "AOV") {
    return `$${val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${val.toLocaleString()}`;
}
