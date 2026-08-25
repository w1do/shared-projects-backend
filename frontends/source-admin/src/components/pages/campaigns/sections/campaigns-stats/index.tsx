"use client";

import React, { useMemo } from "react";
import { DollarSign, TrendingUp, Percent, Eye } from "lucide-react";
import type { Campaign } from "@/lib/admin/mocks/types";
import { formatCurrency } from "@/lib/utils";
import { formatAdminNumber as formatNumber } from "@/lib/admin/formatters";

interface CampaignsStatsProps {
  campaigns: Campaign[];
}

export function CampaignsStats({ campaigns }: CampaignsStatsProps) {
  const totalBudget = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c.budget ?? 0), 0),
    [campaigns],
  );
  const totalRevenue = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c.revenue ?? 0), 0),
    [campaigns],
  );
  const totalViews = useMemo(
    () => campaigns.reduce((sum, c) => sum + (c.views ?? 0), 0),
    [campaigns],
  );
  const averageRoas = useMemo(() => {
    const active = campaigns.filter((c) => c.roas > 0);
    if (active.length === 0) return 0;
    return active.reduce((sum, c) => sum + c.roas, 0) / active.length;
  }, [campaigns]);

  const statsItems = [
    {
      title: "Total Budget",
      value: formatCurrency(totalBudget),
      description: "Allocated across active drops",
      icon: DollarSign,
    },
    {
      title: "Generated Revenue",
      value: formatCurrency(totalRevenue),
      description: "Total sales tracked",
      icon: TrendingUp,
    },
    {
      title: "Average ROAS",
      value: `${averageRoas.toFixed(1)}×`,
      description: "Return on Ad Spend average",
      icon: Percent,
    },
    {
      title: "Total Traffic",
      value: formatNumber(totalViews),
      description: "Views on campaign landing pages",
      icon: Eye,
    },
  ];

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 sm:grid-cols-2 lg:grid-cols-4">
      {statsItems.map((item, index) => {
        const IconComponent = item.icon;

        return (
          <div
            key={index}
            className="flex items-start justify-between p-6 border-b border-border/60 last:border-b-0 sm:even:border-l sm:even:border-border/60 lg:border-l lg:border-border/60 lg:first:border-l-0 lg:border-b-0"
          >
            <div className="flex min-w-0 flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {item.title}
              </span>
              <span className="font-openrunde text-heading-lg text-foreground truncate max-w-40">
                {item.value}
              </span>
              <div className="text-xs text-muted-foreground-lighter">{item.description}</div>
            </div>
            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
              <IconComponent className="size-8 text-muted-foreground" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
