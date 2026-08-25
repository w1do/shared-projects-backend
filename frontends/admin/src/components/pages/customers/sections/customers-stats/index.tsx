"use client";

import { Users, Activity, DollarSign, Crown } from "lucide-react";
import { KpiStatCard } from "@/components/shared";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";

interface CustomersStatsProps {
  customers: DetailedCustomer[];
}

export function CustomersStats({ customers }: CustomersStatsProps) {
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.status === "Active").length;
  const activeRate = totalCount > 0 ? (activeCount / totalCount) * 100 : 0;

  const totalSpentSum = customers.reduce((acc, c) => acc + c.totalSpent, 0);
  const avgCLV = totalCount > 0 ? totalSpentSum / totalCount : 0;

  const vipCount = customers.filter((c) => c.tier === "Platinum" || c.tier === "Gold").length;
  const vipRate = totalCount > 0 ? (vipCount / totalCount) * 100 : 0;

  const customersTrend = [20, 28, 24, 35, 32, 44, 40, 52, 50, 60];
  const retentionTrend = [70, 72, 71, 76, 74, 79, 77, 82, 80, 83];
  const clvTrend = [120, 130, 126, 140, 138, 150, 146, 160, 158, 170];
  const vipTrend = [30, 34, 32, 40, 38, 44, 42, 48, 46, 50];

  const kpis = [
    {
      label: "Total Customers",
      value: totalCount.toString(),
      delta: "+12.4% vs last month",
      icon: Users,
      trend: customersTrend,
    },
    {
      label: "Active Retention",
      value: `${activeRate.toFixed(1)}%`,
      delta: `${activeRate.toFixed(1)}% engagement rate`,
      icon: Activity,
      trend: retentionTrend,
    },
    {
      label: "Average CLV",
      value: `$${avgCLV.toFixed(2)}`,
      delta: "Total spent per user base",
      icon: DollarSign,
      trend: clvTrend,
    },
    {
      label: "VIP Tier Ratio",
      value: `${vipRate.toFixed(1)}%`,
      delta: "Platinum & Gold members",
      icon: Crown,
      trend: vipTrend,
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
