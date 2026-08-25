"use client";

import type { ProductFull } from "@/lib/admin/mocks/catalog";
import { Link2, Sparkles, Eye, Layers } from "lucide-react";

interface StatVariantGroup {
  id: string;
  status: "active" | "draft";
  members: { productId: string }[];
}

interface VariantGroupsStatsProps {
  groups: StatVariantGroup[];
  products: ProductFull[];
}

export function VariantGroupsStats({ groups, products }: VariantGroupsStatsProps) {
  const activeCount = groups.filter((g) => g.status === "active").length;

  // Calculate catalog coverage
  const linkedProductIds = new Set<string>();
  groups.forEach((g) => {
    g.members.forEach((m) => {
      // Clean base product id from variations (e.g. p1-2 -> p1)
      const baseId = m.productId.split("-")[0];
      if (baseId) linkedProductIds.add(baseId);
    });
  });

  const totalBaseProducts = products.length || 1;
  const coveragePercent = Math.min(
    100,
    Math.round((linkedProductIds.size / totalBaseProducts) * 100),
  );

  const stats = [
    {
      label: "Variant Groups",
      value: groups.length.toString(),
      icon: Layers,
      iconBg: "bg-accent text-foreground",
    },
    {
      label: "Active Switchers",
      value: activeCount.toString(),
      icon: Sparkles,
      iconBg: "bg-accent text-foreground",
    },
    {
      label: "Catalog Coverage",
      value: `${coveragePercent}%`,
      icon: Link2,
      iconBg: "bg-accent text-foreground",
      highlight: coveragePercent < 60,
    },
    {
      label: "Storefront Clicks (Today)",
      value: "8,412",
      icon: Eye,
      iconBg: "bg-accent text-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-start justify-between border-b border-r border-border/60 p-6"
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs text-muted-foreground">{stat.label}</span>
              <span
                className={
                  "font-openrunde text-heading-lg " +
                  (stat.highlight ? "text-brand-accent" : "text-foreground")
                }
              >
                {stat.value}
              </span>
            </div>

            <div
              className={`flex size-16 items-center justify-center rounded-xl shrink-0 ${stat.iconBg}`}
            >
              <Icon className="size-8" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
