"use client";

import { Copy, ArrowUpRight, CalendarRange, Radio, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/inputs/button";
import { Badge } from "@/components/ui/data-display/badge";
import { Progress } from "@/components/ui/feedback/progress";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { statusBadgeColor } from "@/components/pages/promotions/config/filters";
import { formatPromoDate, rewardHeadline, usagePercent } from "@/components/pages/promotions/utils";

interface PromotionsSpotlightProps {
  promotion: Promotion;
  onViewDetails: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
}

export function PromotionsSpotlight({
  promotion,
  onViewDetails,
  onEdit,
}: PromotionsSpotlightProps) {
  const gradientId = `promo-spotlight-${promotion.id}`;
  const headline = rewardHeadline(promotion);
  const pct = usagePercent(promotion);

  const copyCode = () => {
    navigator.clipboard.writeText(promotion.code);
    toast.success(`Code ${promotion.code} copied to clipboard`);
  };

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 md:flex-row">
      <AdminDynamicStyles
        gradients={[{ id: gradientId, start: promotion.gradient[0], end: promotion.gradient[1] }]}
      />

      {/* Reward stub */}
      <div
        className="admin-gradient-swatch min-w-52 flex flex-col justify-between gap-6 p-8"
        data-admin-gradient={gradientId}
      >
        <span className="text-caption font-semibold uppercase tracking-wider text-foreground/75">
          Spotlight
        </span>
        <div className="flex flex-col">
          <span className="promo-reward-value font-openrunde font-semibold text-foreground whitespace-nowrap">
            {headline.value}
          </span>
          <span className="mt-2 text-caption font-semibold uppercase tracking-wider text-foreground/75">
            {headline.unit}
          </span>
        </div>
        <Badge variant="soft" color="surface" shape="circle" size="sm">
          {promotion.code}
        </Badge>
      </div>

      {/* Perforated seam */}
      <div className="relative hidden border-l-2 border-dashed border-border md:block">
        <span className="absolute size-notch rounded-full bg-background top-notch-offset left-1/2 -translate-x-1/2" />
        <span className="absolute size-notch rounded-full bg-background bottom-notch-offset left-1/2 -translate-x-1/2" />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between gap-6 p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={statusBadgeColor(promotion.status)} shape="circle">
              {promotion.status}
            </Badge>
            <Badge color="muted" shape="circle" startIcon={<Radio />}>
              {promotion.channel}
            </Badge>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="font-openrunde text-heading tracking-tight text-foreground">
              {promotion.title}
            </h2>
            <p className="max-w-prose text-caption text-muted-foreground">
              {promotion.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-caption">
            <span className="flex items-center gap-2 text-muted-foreground-lighter">
              <CalendarRange className="size-4" />
              {formatPromoDate(promotion.startsAt)} – {formatPromoDate(promotion.endsAt)}
            </span>
            <span className="font-medium text-muted-foreground">
              {promotion.used.toLocaleString()} / {promotion.limit.toLocaleString()} used
            </span>
          </div>
          <Progress value={pct} size="sm" />

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              variant="contained"
              shape="circle"
              size="sm"
              startIcon={<Copy />}
              onClick={copyCode}
            >
              Copy code
            </Button>
            <Button
              variant="outlined"
              shape="circle"
              size="sm"
              startIcon={<Pencil />}
              onClick={() => onEdit(promotion)}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              shape="circle"
              size="sm"
              endIcon={<ArrowUpRight />}
              onClick={() => onViewDetails(promotion)}
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
