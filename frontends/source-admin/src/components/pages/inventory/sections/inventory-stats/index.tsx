"use client";

import { formatCurrency } from "@/lib/utils";
import { formatAdminNumber as formatNumber } from "@/lib/admin/formatters";
import type { InventoryItem } from "@/lib/admin/mocks/types";
import { Coins, AlertTriangle, AlertCircle, Truck } from "lucide-react";

interface InventoryStatsProps {
  items: InventoryItem[];
}

export function InventoryStats({ items }: InventoryStatsProps) {
  const totalValue = items.reduce((sum, item) => sum + item.stock * item.price, 0);
  const outOfStockCount = items.filter((item) => item.stock === 0).length;
  const lowStockCount = items.filter(
    (item) => item.stock > 0 && item.stock <= item.threshold,
  ).length;
  const totalIncoming = items.reduce((sum, item) => sum + item.incoming, 0);

  const stats = [
    {
      title: "Total Stock Value",
      value: formatCurrency(totalValue),
      subtitle: `Across ${formatNumber(items.length)} catalog SKU items`,
      icon: Coins,
      borderClassName: "border-b border-r border-border/60 sm:border-b-0 lg:border-b-0",
      valueClassName: "text-foreground",
      iconWrapperClassName: "bg-muted text-foreground",
    },
    {
      title: "Out of Stock",
      value: outOfStockCount,
      subtitle: "Items requiring restock",
      icon: AlertTriangle,
      borderClassName: "border-b border-r border-border/60 sm:border-b-0 lg:border-b-0",
      valueClassName: outOfStockCount > 0 ? "text-destructive" : "text-foreground",
      iconWrapperClassName:
        outOfStockCount > 0 ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground",
    },
    {
      title: "Low Stock Alerts",
      value: lowStockCount,
      subtitle: "Items below alert threshold",
      icon: AlertCircle,
      borderClassName: "border-b border-r border-border/60 lg:border-b-0",
      valueClassName: lowStockCount > 0 ? "text-brand-accent" : "text-foreground",
      iconWrapperClassName:
        lowStockCount > 0 ? "bg-brand-accent/10 text-brand-accent" : "bg-muted text-foreground",
    },
    {
      title: "Supply Incoming",
      value: `+${formatNumber(totalIncoming)}`,
      subtitle: "Units currently in transit",
      icon: Truck,
      borderClassName: "",
      valueClassName: "text-foreground",
      iconWrapperClassName: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className={`flex items-start justify-between p-6 ${stat.borderClassName}`}
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
              <span className={`font-openrunde text-heading-lg ${stat.valueClassName}`}>
                {stat.value}
              </span>
              <span className="text-xs text-muted-foreground-lighter">{stat.subtitle}</span>
            </div>
            <div
              className={`flex size-16 shrink-0 items-center justify-center rounded-xl ${stat.iconWrapperClassName}`}
            >
              <Icon className="size-8" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
