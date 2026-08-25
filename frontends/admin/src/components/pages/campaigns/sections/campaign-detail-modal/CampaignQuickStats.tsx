import React from "react";
import type { Campaign } from "@/lib/admin/mocks/types";
import { formatCurrency } from "@/lib/utils";
import { formatAdminNumber as formatNumber } from "@/lib/admin/formatters";

interface CampaignQuickStatsProps {
  campaign: Campaign;
}

export function CampaignQuickStats({ campaign }: CampaignQuickStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-muted/40">
      <div className="flex flex-col">
        <span className="text-caption text-muted-foreground uppercase tracking-wider">Budget</span>
        <span className="text-sm font-semibold mt-2">{formatCurrency(campaign.budget ?? 0)}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-caption text-muted-foreground uppercase tracking-wider">Revenue</span>
        <span className="text-sm font-semibold text-primary mt-2">
          {formatCurrency(campaign.revenue ?? 0)}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-caption text-muted-foreground uppercase tracking-wider">Views</span>
        <span className="text-sm font-semibold mt-2">{formatNumber(campaign.views ?? 0)}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-caption text-muted-foreground uppercase tracking-wider">ROAS</span>
        <span className="text-sm font-semibold mt-2">
          {campaign.roas > 0 ? `${campaign.roas}x` : "—"}
        </span>
      </div>
    </div>
  );
}
