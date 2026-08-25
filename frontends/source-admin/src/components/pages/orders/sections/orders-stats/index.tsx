"use client";

import { TrendingUp, ShoppingBag, DollarSign, Clock } from "lucide-react";
import { KpiStatCard } from "@/components/shared";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";

interface OrdersStatsProps {
  orders: DetailedOrder[];
}

export function OrdersStats({ orders }: OrdersStatsProps) {
  const totalRevenue = orders
    .filter((o) => o.status !== "Refunded")
    .reduce((sum, o) => sum + o.total, 0);
  const pendingFulfillment = orders.filter(
    (o) => o.status === "Processing" || o.status === "Pending",
  ).length;

  const completedOrders = orders.filter((o) => o.status !== "Refunded");
  const averageOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const revenueTrend = [25, 40, 35, 50, 48, 65, 55, 75, 70, 85];
  const ordersTrend = [12, 18, 14, 22, 19, 25, 22, 28, 27, 30];
  const aovTrend = [150, 155, 153, 162, 160, 168, 165, 172, 170, 178];
  const pendingTrend = [5, 7, 4, 6, 8, 5, 6, 4, 5, 3];

  const kpis = [
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      delta: "+12.4%",
      icon: DollarSign,
      trend: revenueTrend,
    },
    {
      label: "Total Orders",
      value: `${orders.length}`,
      delta: "+8.2%",
      icon: ShoppingBag,
      trend: ordersTrend,
    },
    {
      label: "Average Order Value",
      value: `$${averageOrderValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      delta: "+3.6%",
      icon: TrendingUp,
      trend: aovTrend,
    },
    {
      label: "Pending Fulfillment",
      value: `${pendingFulfillment}`,
      delta: "3 active",
      icon: Clock,
      trend: pendingTrend,
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
