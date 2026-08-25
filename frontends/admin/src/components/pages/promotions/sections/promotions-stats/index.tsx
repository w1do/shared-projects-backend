"use client";

import { TicketPercent, Repeat2, DollarSign, Gauge } from "lucide-react";
import { KpiStatCard } from "@/components/shared";
import type { Promotion } from "@/lib/admin/mocks/promotions";

interface PromotionsStatsProps {
  promotions: Promotion[];
}

export function PromotionsStats({ promotions }: PromotionsStatsProps) {
  const activeCount = promotions.filter((p) => p.status === "Active").length;
  const totalRedemptions = promotions.reduce((sum, p) => sum + p.used, 0);
  const totalRevenue = promotions.reduce((sum, p) => sum + p.revenue, 0);

  const capped = promotions.filter((p) => p.limit > 0);
  const avgRedemptionRate =
    capped.length > 0
      ? (capped.reduce((sum, p) => sum + p.used / p.limit, 0) / capped.length) * 100
      : 0;

  const redemptionsTrend = [12, 20, 16, 28, 25, 36, 32, 44, 41, 52];
  const activeTrend = [3, 4, 4, 5, 5, 6, 5, 6, 6, 7];
  const revenueTrend = [30, 42, 38, 52, 48, 64, 60, 74, 70, 86];
  const rateTrend = [40, 44, 42, 50, 48, 55, 52, 60, 58, 64];

  const kpis = [
    {
      label: "Active Promotions",
      value: `${activeCount}`,
      delta: `${promotions.length} total programs`,
      icon: TicketPercent,
      trend: activeTrend,
    },
    {
      label: "Total Redemptions",
      value: totalRedemptions.toLocaleString("en-US"),
      delta: "+18.7% vs last month",
      icon: Repeat2,
      trend: redemptionsTrend,
    },
    {
      label: "Revenue Influenced",
      value: `$${totalRevenue.toLocaleString("en-US")}`,
      delta: "Attributed to active codes",
      icon: DollarSign,
      trend: revenueTrend,
    },
    {
      label: "Avg. Redemption Rate",
      value: `${avgRedemptionRate.toFixed(1)}%`,
      delta: "Used against caps",
      icon: Gauge,
      trend: rateTrend,
      accent: true,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <KpiStatCard key={kpi.label} {...kpi} />
      ))}
    </div>
  );
}
