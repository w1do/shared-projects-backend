import type { DetailedCustomer } from "@/lib/admin/types/customers";
import type { ApiCustomer, ApiDashboardStats, ApiRevenuePoint } from "../api-types";
import { semanticColors } from "@/lib/theme-colors";
import { initials, money, titleCase } from "./shared";
import { t } from "@/lib/admin/console-texts";

export function mapDashboard(
  stats: ApiDashboardStats,
  revenue: ApiRevenuePoint[],
) {
  return {
    kpis: [
      {
        label: t("console.dashboard.kpi-revenue"),
        value: `$${money(stats.revenue).toLocaleString()}`,
        delta: 0,
        accent: true,
        spark: revenue.map((p) => money(p.revenue)),
      },
      {
        label: t("console.dashboard.kpi-payments"),
        value: stats.orders.toLocaleString(),
        delta: 0,
        accent: false,
        spark: revenue.map((p) => p.orders),
      },
      {
        label: t("console.dashboard.kpi-average-payment"),
        value: `$${money(stats.averageOrderValue).toLocaleString()}`,
        delta: 0,
        accent: false,
        spark: revenue.map((p) => money(p.revenue) / Math.max(1, p.orders)),
      },
      {
        label: t("console.dashboard.kpi-customers"),
        value: stats.customers.toLocaleString(),
        delta: 0,
        accent: false,
        spark: revenue.map((_, index) => index + 1),
      },
    ],
    revenueSeries: revenue.map((point) => {
      const rev = money(point.revenue);
      const ords = point.orders;
      const aov = ords > 0 ? rev / ords : 0;
      return {
        week: point.label,
        revenue: rev,
        prev: 0,
        orders: ords,
        ordersPrev: 0,
        aov: aov,
        aovPrev: 0,
      };
    }),
  };
}

export function mapCustomer(customer: ApiCustomer): DetailedCustomer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: "",
    avatar: initials(customer.name),
    avatarUrl: customer.avatarUrl ?? undefined,
    gradient: [semanticColors.accent, semanticColors.brandAccentHover],
    tier: customer.tier
      ? (titleCase(customer.tier) as NonNullable<DetailedCustomer["tier"]>)
      : undefined,
    status: customer.status ?? "Active",
    skinProfile: {
      skinType: titleCase(
        customer.skinType,
      ) as DetailedCustomer["skinProfile"]["skinType"],
      skinConcerns: customer.skinConcerns ?? [],
    },
    totalSpent: money(customer.totalSpent),
    totalOrders: customer.totalOrders,
    joinedAt:
      customer.joinedAt ?? customer.createdAt ?? new Date().toISOString(),
    addresses: {
      shipping: { street: "", city: "", country: "", zip: "" },
      billing: { street: "", city: "", country: "", zip: "" },
    },
    activities: [],
  };
}
