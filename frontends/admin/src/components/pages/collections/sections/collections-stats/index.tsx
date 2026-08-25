"use client";

import { formatCurrency } from "@/lib/utils";
import { formatAdminNumber as formatNumber } from "@/lib/admin/formatters";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { Collection } from "@/lib/admin/mocks/types";
import { FolderHeart, DollarSign, Eye, BarChart3 } from "lucide-react";
import { CollectionStatCard } from "./components/CollectionStatCard";

interface CollectionsStatsProps {
  collections: Collection[];
}

export function CollectionsStats({ collections }: CollectionsStatsProps) {
  const totalCollections = collections.length;
  const activeCollections = collections.filter((c) => c.status === "Active").length;
  const draftCollections = collections.filter((c) => c.status === "Draft").length;

  const totalRevenue = collections.reduce((sum, c) => sum + c.revenue, 0);
  const totalViews = collections.reduce((sum, c) => sum + c.views, 0);

  const bestPerformer = collections.reduce(
    (best, c) => (c.revenue > best.revenue ? c : best),
    collections[0] || { name: "None", revenue: 0 },
  );

  // Traffic share: show the two most-viewed drops, group the rest as "Others".
  const viewedCollections = [...collections]
    .filter((c) => c.views > 0)
    .sort((a, b) => b.views - a.views);
  const restViews = viewedCollections.slice(2).reduce((sum, c) => sum + c.views, 0);
  const trafficSegments = [
    ...viewedCollections.slice(0, 2).map((c) => ({ id: c.id, name: c.name, views: c.views })),
    ...(viewedCollections.length > 2 ? [{ id: "others", name: "Others", views: restViews }] : []),
  ];
  const trafficColors = ["bg-chart-1", "bg-chart-2", "bg-muted-foreground-lighter"];

  const progress = trafficSegments.map((segment) => ({
    id: `collection-traffic-${segment.id}`,
    value: totalViews > 0 ? (segment.views / totalViews) * 100 : 0,
  }));

  const statCardsConfig = [
    {
      id: "collections",
      label: "Total Collections",
      value: totalCollections,
      description: `${activeCollections} active, ${draftCollections} draft`,
      icon: FolderHeart,
      position: 1 as const,
    },
    {
      id: "revenue",
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      description: (
        <span className="block truncate" title={`Top: ${bestPerformer.name}`}>
          Top: {bestPerformer.name}
        </span>
      ),
      icon: DollarSign,
      position: 2 as const,
      iconTone: "accent" as const,
    },
    {
      id: "views",
      label: "Total Views",
      value: formatNumber(totalViews),
      description: "Across all active drops",
      icon: Eye,
      position: 3 as const,
    },
  ];

  return (
    <>
      <AdminDynamicStyles progress={progress} />
      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCardsConfig.map((card) => (
          <CollectionStatCard
            key={card.id}
            label={card.label}
            value={card.value}
            description={card.description}
            icon={card.icon}
            position={card.position}
            iconTone={card.iconTone}
          />
        ))}

        {/* Card 4: View Distribution */}
        <div className="flex flex-col justify-between p-6">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between w-full">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                Traffic Share
              </span>
              <BarChart3 className="size-4 text-muted-foreground-lighter" />
            </div>

            {/* Stacked Share Bar */}
            <div className="h-2 w-full rounded-full overflow-hidden flex bg-muted mt-2">
              {trafficSegments.map((segment, index) => {
                const share = totalViews > 0 ? (segment.views / totalViews) * 100 : 0;
                return (
                  <div
                    key={segment.id}
                    className={`h-full transition-all duration-300 w-admin-progress ${trafficColors[index]}`}
                    data-admin-progress={`collection-traffic-${segment.id}`}
                    title={`${segment.name}: ${share.toFixed(1)}%`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-caption text-muted-foreground">
              {trafficSegments.map((segment, index) => {
                const share = totalViews > 0 ? (segment.views / totalViews) * 100 : 0;
                return (
                  <div key={segment.id} className="flex items-center gap-1 min-w-0">
                    <span className={`size-2 rounded-full shrink-0 ${trafficColors[index]}`} />
                    <span className="truncate max-w-40">
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
