"use client";

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Link, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Label } from "@/components/ui/inputs/label";
import { usePromotionsQuery } from "@/hooks/admin/promotions";
import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";
import { PromotionLinkDialog } from "./PromotionLinkDialog";

export function PromotionSelector() {
  const { data: promotions = [] } = usePromotionsQuery();
  const { control } = useFormContext<CampaignFormValues>();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Controller
      control={control}
      name="promotionIds"
      render={({ field, fieldState: { error } }) => {
        const selectedIds = field.value || [];
        const togglePromotion = (id: string) => {
          const isSel = selectedIds.includes(id);
          field.onChange(isSel ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
        };

        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-semibold text-muted-foreground">
                Discount Promotions (Choose at least one)
              </Label>
              <Button
                type="button"
                variant="soft"
                shape="circle"
                size="sm"
                startIcon={<Link />}
                onClick={() => setIsOpen(true)}
              >
                Select Promotions
              </Button>
            </div>

            {selectedIds.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-muted/20 p-2">
                {selectedIds.map((promoId) => {
                  const promoObj = promotions.find((x) => x.id === promoId);
                  return (
                    <div
                      key={promoId}
                      className="flex items-center justify-between p-4 bg-card border border-border/40 rounded-xl"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-mono font-semibold text-primary">
                          {promoObj?.code ?? promoId}
                        </span>
                        <span className="text-caption text-muted-foreground-lighter mt-2">
                          {promoObj?.title} &bull; {promoObj?.status}
                        </span>
                      </div>
                      <IconButton
                        type="button"
                        variant="ghost"
                        color="error"
                        shape="circle"
                        onClick={() => togglePromotion(promoId)}
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-border/60 bg-muted/10 rounded-2xl text-xs text-muted-foreground-lighter">
                No promotions linked yet. Click 'Select Promotions' to link them.
              </div>
            )}

            {error && (
              <p className="ui-form-help-text font-medium text-destructive">{error.message}</p>
            )}

            <PromotionLinkDialog
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              selectedIds={selectedIds}
              onToggle={togglePromotion}
            />
          </div>
        );
      }}
    />
  );
}
