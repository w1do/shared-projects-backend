"use client";

import { formatCurrency } from "@/lib/utils";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { Category } from "@/lib/admin/types/catalog";
import { FolderHeart, Trophy, TrendingUp, BarChart4 } from "lucide-react";
import { CategoryStatCard } from "./components/CategoryStatCard";

interface CategoriesStatsProps {
  categories: Category[];
}

export function CategoriesStats({ categories }: CategoriesStatsProps) {
  // 1. Category counts
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.status === "Active").length;
  const draftCategories = categories.filter((c) => c.status === "Draft").length;

  // 2. Product Coverage
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  // 3. Top category by revenue
  const topCategory = categories.reduce(
    (max, c) => (c.revenue > max.revenue ? c : max),
    categories[0] || { name: "N/A", revenue: 0 },
  );

  // Revenue share: show the two biggest categories, group the rest as "Others".
  const totalRevenue = categories.reduce((sum, c) => sum + c.revenue, 0);
  const sortedByRevenue = [...categories].sort((a, b) => b.revenue - a.revenue);
  const restRevenue = sortedByRevenue.slice(2).reduce((sum, c) => sum + c.revenue, 0);
  const shareSegments = [
    ...sortedByRevenue.slice(0, 2).map((c) => ({ id: c.id, name: c.name, revenue: c.revenue })),
    ...(sortedByRevenue.length > 2 ? [{ id: "others", name: "Others", revenue: restRevenue }] : []),
  ];
  const shareColors = ["bg-chart-1", "bg-chart-2", "bg-muted-foreground-lighter"];

  const progress = shareSegments.map((segment) => ({
    id: `category-revenue-share-${segment.id}`,
    value: totalRevenue > 0 ? (segment.revenue / totalRevenue) * 100 : 0,
  }));

  const statCardsConfig = [
    {
      id: "structure",
      label: "Categories Structure",
      value: totalCategories,
      description: (
        <>
          {activeCategories} active
          {draftCategories > 0 ? ` \u00b7 ${draftCategories} draft` : ""}
        </>
      ),
      icon: FolderHeart,
      position: 1 as const,
    },
    {
      id: "coverage",
      label: "Catalog Coverage",
      value: `${totalProducts} Items`,
      description: "100% categorized catalog",
      icon: BarChart4,
      position: 2 as const,
    },
    {
      id: "top",
      label: "Top Category",
      value: topCategory.name,
      description: `${formatCurrency(topCategory.revenue)} generated`,
      icon: Trophy,
      position: 3 as const,
      iconTone: "accent" as const,
    },
  ];

  return (
    <>
      <AdminDynamicStyles progress={progress} />
      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCardsConfig.map((card) => (
          <CategoryStatCard
            key={card.id}
            label={card.label}
            value={card.value}
            description={card.description}
            icon={card.icon}
            position={card.position}
            iconTone={card.iconTone}
          />
        ))}

        {/* Card 4: Revenue Share */}
        <div className="flex flex-col justify-between p-6">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Revenue Share
              </span>
              <TrendingUp className="size-4 text-muted-foreground-lighter" />
            </div>

            {/* Stacked Revenue Share Bar */}
            <div className="h-2 w-full rounded-full overflow-hidden flex bg-muted mt-2">
              {shareSegments.map((segment, index) => {
                const share = totalRevenue > 0 ? (segment.revenue / totalRevenue) * 100 : 0;
                return (
                  <div
                    key={segment.id}
                    className={`h-full w-admin-progress ${shareColors[index]}`}
                    data-admin-progress={`category-revenue-share-${segment.id}`}
                    title={`${segment.name}: ${share.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-caption text-muted-foreground">
              {shareSegments.map((segment, index) => {
                const share = totalRevenue > 0 ? (segment.revenue / totalRevenue) * 100 : 0;
                return (
                  <div key={segment.id} className="flex items-center gap-1">
                    <span className={`size-2 rounded-full ${shareColors[index]}`} />
                    <span>
                      {segment.name} ({share.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
