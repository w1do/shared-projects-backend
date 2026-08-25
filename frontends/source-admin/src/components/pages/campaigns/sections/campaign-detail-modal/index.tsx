"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/overlay/dialog";
import { Separator } from "@/components/ui/data-display/separator";
import type { Campaign } from "@/lib/admin/mocks/types";
import { TrendChart } from "./TrendChart";
import { CollectionsList } from "./CollectionsList";
import { PromotionsList } from "./PromotionsList";
import { CampaignQuickStats } from "./CampaignQuickStats";
import { CampaignModalHeader } from "./CampaignModalHeader";
import { CampaignModalFooter } from "./CampaignModalFooter";

interface CampaignDetailModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function CampaignDetailModal({
  campaign: selectedCampaign,
  isOpen,
  onClose,
  onDelete,
}: CampaignDetailModalProps) {
  if (!selectedCampaign) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" padding="none" radius="3xl" scroll>
        <CampaignModalHeader campaign={selectedCampaign} />

        <div className="flex max-h-dialog-scroll flex-col gap-6 overflow-y-auto p-6">
          <DialogDescription className="text-xs text-muted-foreground">
            {selectedCampaign.description}
          </DialogDescription>

          <CampaignQuickStats campaign={selectedCampaign} />

          <TrendChart performanceTrend={selectedCampaign.performanceTrend ?? []} />

          <CollectionsList collectionIds={selectedCampaign.collectionIds ?? []} />

          <PromotionsList promotionIds={selectedCampaign.promotionIds ?? []} />

          <div className="flex flex-col gap-2">
            <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground">
              Campaign Timeline
            </span>
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
              <div className="flex items-center gap-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground-lighter">
                    Starts
                  </span>
                  <span className="mt-0 text-xs font-semibold text-foreground">
                    {selectedCampaign.startsAt || "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 border-l border-border/60 pl-4">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Calendar className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground-lighter">
                    Ends
                  </span>
                  <span className="mt-0 text-xs font-semibold text-foreground">
                    {selectedCampaign.endsAt || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <CampaignModalFooter
            campaignId={selectedCampaign.id}
            onClose={onClose}
            onDelete={onDelete}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
