"use client";

import { CalendarRange } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { Card } from "@/components/ui/data-display/card";
import { Progress } from "@/components/ui/feedback/progress";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { statusBadgeColor } from "@/components/pages/promotions/config/filters";
import { formatPromoDate, rewardHeadline, usagePercent } from "@/components/pages/promotions/utils";
import { cn } from "@/lib/utils";

interface PromotionCardProps {
  promotion: Promotion;
  onViewDetails: (promotion: Promotion) => void;
}

function handleCardKeyDown(
  event: React.KeyboardEvent,
  onViewDetails: (promotion: Promotion) => void,
  promotion: Promotion,
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onViewDetails(promotion);
  }
}

export function PromotionCard({ promotion, onViewDetails }: PromotionCardProps) {
  const gradientId = `promo-card-${promotion.id}`;
  const headline = rewardHeadline(promotion);

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-label={`View promotion ${promotion.code}: ${promotion.title}`}
      onClick={() => onViewDetails(promotion)}
      onKeyDown={(event) => handleCardKeyDown(event, onViewDetails, promotion)}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border-border/60 bg-card text-left shadow-subtle-3 transition-all duration-300",
        "hover:border-primary/40",
        "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <AdminDynamicStyles
        gradients={[{ id: gradientId, start: promotion.gradient[0], end: promotion.gradient[1] }]}
      />

      <div
        className="admin-gradient-swatch flex items-center justify-between gap-4 p-6"
        data-admin-gradient={gradientId}
      >
        <div className="flex flex-col">
          <span className="font-openrunde text-heading-lg leading-none text-foreground">
            {headline.value}
          </span>
          <span className="mt-2 text-caption font-semibold uppercase tracking-wider text-foreground/70">
            {headline.unit}
          </span>
        </div>
        <Badge color={statusBadgeColor(promotion.status)} shape="circle">
          {promotion.status}
        </Badge>
      </div>

      <div className="relative border-t-2 border-dashed border-border">
        <span className="absolute size-card-notch rounded-full bg-background left-card-notch-offset top-1/2 -translate-y-1/2" />
        <span className="absolute size-card-notch rounded-full bg-background right-card-notch-offset top-1/2 -translate-y-1/2" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-muted px-2 py-2 font-mono text-xs font-semibold text-foreground">
            {promotion.code}
          </span>
          <span className="text-caption text-muted-foreground-lighter">{promotion.channel}</span>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-body font-semibold text-foreground truncate">
            {promotion.title}
          </span>
          <span className="text-caption text-muted-foreground text-line-2">
            {promotion.description}
          </span>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <div className="flex items-center justify-between text-caption text-muted-foreground">
            <span>{promotion.used.toLocaleString()} redeemed</span>
            <span className="text-muted-foreground-lighter">{usagePercent(promotion)}%</span>
          </div>
          <Progress value={usagePercent(promotion)} size="sm" />
          <span className="mt-2 flex items-center gap-2 text-caption text-muted-foreground-lighter">
            <CalendarRange className="size-4" />
            {formatPromoDate(promotion.startsAt)} – {formatPromoDate(promotion.endsAt)}
          </span>
        </div>
      </div>
    </Card>
  );
}
