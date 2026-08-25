"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Progress } from "@/components/ui/feedback/progress";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { Card } from "@/components/ui/data-display/card";
import { useCollectionsQuery } from "@/hooks/admin/collections";
import { usePromotionsQuery } from "@/hooks/admin/promotions";
import type { Campaign } from "@/lib/admin/mocks/types";
import { cn, formatCurrency } from "@/lib/utils";

const statusColorMap = {
  Active: "success",
  Scheduled: "warning",
  Completed: "neutral",
  Draft: "neutral",
} as const;

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
}

function handleCardKeyDown(event: React.KeyboardEvent, onClick: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onClick();
  }
}

export function CampaignCard({ campaign: c, onClick }: CampaignCardProps) {
  const { data: promotions = [] } = usePromotionsQuery();
  const { data: collections = [] } = useCollectionsQuery();
  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`Open campaign ${c.name}`}
      onClick={onClick}
      onKeyDown={(event) => handleCardKeyDown(event, onClick)}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border-border/60 bg-card shadow-subtle-2 transition-all duration-300",
        "hover:border-primary/40 hover:shadow-subtle-3",
        "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div className="relative w-full overflow-hidden bg-muted">
        <Avatar
          src={c.banner}
          alt={c.name}
          size="full"
          shape="square"
          className="w-full aspect-banner"
          fallback={c.name ? c.name.substring(0, 2).toUpperCase() : "CA"}
        />
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
          <Badge
            variant="contained"
            size="lg"
            color={statusColorMap[c.status || "Draft"]}
            shape="circle"
          >
            {c.status || "Draft"}
          </Badge>
          <Badge variant="contained" size="lg" color="surface" shape="circle">
            {c.channel}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start gap-4">
          <Avatar
            src={c.thumbnail || c.banner}
            alt={c.name}
            size="lg"
            shape="rounded"
            fallback={c.name ? c.name.substring(0, 2).toUpperCase() : "CA"}
          />
          <div className="flex min-w-0 flex-col">
            <h3 className="truncate font-openrunde text-heading font-normal text-foreground transition-colors group-hover:text-primary">
              {c.name}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-caption text-muted-foreground">
            <span>Budget spent</span>
            <span className="font-semibold">{formatCurrency(c.budget ?? 0)} allocated</span>
          </div>
          <Progress
            value={c.status === "Active" ? 75 : c.status === "Completed" ? 100 : 0}
            size="sm"
          />
        </div>

        <div className="mt-2 flex items-center gap-8 border-t border-border/40 pt-2">
          <div className="flex flex-col">
            <span className="text-caption uppercase tracking-wider text-muted-foreground">
              Revenue
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(c.revenue ?? 0)}
            </span>
          </div>

          <div className="h-8 w-24">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={(c.performanceTrend || []).map((v, i) => ({ val: v, index: i }))}>
                <defs>
                  <linearGradient id={`grad-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="var(--color-primary)"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill={`url(#grad-${c.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1" />
          <div className="flex flex-col items-end">
            <span className="text-caption uppercase tracking-wider text-muted-foreground">
              ROAS
            </span>
            <span className="text-sm font-semibold text-foreground">
              {c.roas > 0 ? `${c.roas}x` : "—"}
            </span>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {(c.collectionIds || []).slice(0, 1).map((colId) => {
            const colName = collections.find((item) => item.id === colId)?.name ?? colId;
            return (
              <Badge key={colId} variant="soft" color="neutral" shape="rectangle" size="lg">
                Collection: {colName}
              </Badge>
            );
          })}
          {c.collectionIds && c.collectionIds.length > 1 && (
            <Badge variant="soft" color="neutral" shape="circle" size="lg">
              +{c.collectionIds.length - 1}
            </Badge>
          )}
          <div className="flex-1" />
          {c.promotionIds && c.promotionIds.length > 1 && (
            <Badge variant="contained" color="secondary" shape="circle" size="lg">
              +{c.promotionIds.length - 1}
            </Badge>
          )}
          {(c.promotionIds || []).slice(0, 1).map((promoId) => {
            const promoCode = promotions.find((item) => item.id === promoId)?.code ?? promoId;
            return (
              <Badge
                key={promoId}
                variant="contained"
                color="secondary"
                shape="rectangle"
                size="lg"
              >
                Promo: {promoCode}
              </Badge>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
