"use client";

import { Copy, Pause, Play, CalendarRange, Radio, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { Button } from "@/components/ui/inputs/button";
import { Badge } from "@/components/ui/data-display/badge";
import { Progress } from "@/components/ui/feedback/progress";
import { Separator } from "@/components/ui/data-display/separator";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { statusBadgeColor } from "@/components/pages/promotions/config/filters";
import {
  formatPromoDate,
  formatReward,
  rewardHeadline,
  usagePercent,
} from "@/components/pages/promotions/utils";

interface PromotionDetailModalProps {
  promotion: Promotion | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (promotion: Promotion) => void;
  onToggleStatus: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption text-muted-foreground-lighter">{label}</span>
      <span className="text-xs font-semibold text-foreground">{value}</span>
    </div>
  );
}

export function PromotionDetailModal({
  promotion,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  onDelete,
}: PromotionDetailModalProps) {
  if (!promotion) return null;

  const gradientId = `promo-modal-${promotion.id}`;
  const headline = rewardHeadline(promotion);
  const isPaused = promotion.status === "Paused";
  const canToggle = promotion.status === "Active" || promotion.status === "Paused";

  const copyCode = () => {
    navigator.clipboard.writeText(promotion.code);
    toast.success(`Code ${promotion.code} copied to clipboard`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent padding="none" radius="3xl" scroll>
        <AdminDynamicStyles
          gradients={[{ id: gradientId, start: promotion.gradient[0], end: promotion.gradient[1] }]}
        />

        <DialogHeader
          className="admin-gradient-swatch p-6 text-left"
          data-admin-gradient={gradientId}
        >
          <div className="flex items-center gap-2">
            <Badge color={statusBadgeColor(promotion.status)} shape="circle">
              {promotion.status}
            </Badge>
            <span className="rounded-lg bg-card/70 px-2 py-2 font-mono text-xs font-semibold text-foreground">
              {promotion.code}
            </span>
          </div>
          <div className="mt-4 flex items-end gap-4">
            <span className="promo-reward-value font-openrunde font-semibold text-foreground">
              {headline.value}
            </span>
            <span className="mb-2 text-caption font-semibold uppercase tracking-wider text-foreground/70">
              {headline.unit}
            </span>
          </div>
          <DialogTitle className="mt-2 text-heading tracking-tight">{promotion.title}</DialogTitle>
          <DialogDescription className="text-caption text-foreground/70">
            {promotion.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 p-6">
          <div className="grid grid-cols-2 gap-6">
            <Stat label="Type" value={promotion.type} />
            <Stat label="Reward" value={formatReward(promotion)} />
            <Stat
              label="Minimum spend"
              value={promotion.minSpend > 0 ? `$${promotion.minSpend}` : "No minimum"}
            />
            <div className="flex flex-col gap-2">
              <span className="text-caption text-muted-foreground-lighter">Channel</span>
              <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Radio className="size-4 text-muted-foreground-lighter" />
                {promotion.channel}
              </span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-caption">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                Redemptions
              </span>
              <span className="text-muted-foreground-lighter">
                {usagePercent(promotion)}% of cap
              </span>
            </div>
            <Progress value={usagePercent(promotion)} size="sm" />
            <div className="grid grid-cols-3 gap-6">
              <Stat label="Used" value={promotion.used.toLocaleString()} />
              <Stat label="Cap" value={promotion.limit.toLocaleString()} />
              <Stat label="Revenue" value={`$${promotion.revenue.toLocaleString()}`} />
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <CalendarRange className="size-4 text-muted-foreground-lighter" />
            {formatPromoDate(promotion.startsAt)} – {formatPromoDate(promotion.endsAt)}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <Button
              variant="ghost"
              color="error"
              shape="circle"
              size="sm"
              startIcon={<Trash2 />}
              onClick={() => {
                onDelete(promotion);
                onClose();
              }}
            >
              Delete
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
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
              {canToggle && (
                <Button
                  variant="contained"
                  shape="circle"
                  size="sm"
                  startIcon={isPaused ? <Play /> : <Pause />}
                  onClick={() => onToggleStatus(promotion)}
                >
                  {isPaused ? "Resume" : "Pause"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
