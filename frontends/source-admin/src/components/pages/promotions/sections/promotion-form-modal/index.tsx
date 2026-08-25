"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { Button } from "@/components/ui/inputs/button";
import {
  promotionFormSchema,
  type PromotionFormValues,
} from "@/lib/admin/schemas/content/promotion-form-schema";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { PromotionFormFields } from "./FormFields";
import { createDefaults, DEFAULT_GRADIENT, toDateInput, toIso } from "./utils";

interface PromotionFormModalProps {
  /** When provided, the modal edits this promotion; otherwise it creates a new one. */
  promotion: Promotion | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (promotion: Promotion) => void;
}

export function PromotionFormModal({
  promotion,
  isOpen,
  onClose,
  onSubmit,
}: PromotionFormModalProps) {
  const isEditing = Boolean(promotion);
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: createDefaults(),
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(
      promotion
        ? {
            code: promotion.code,
            title: promotion.title,
            description: promotion.description,
            type: promotion.type,
            rewardValue: promotion.rewardValue,
            minSpend: promotion.minSpend,
            limit: promotion.limit,
            channel: promotion.channel,
            status: promotion.status,
            startsAt: toDateInput(promotion.startsAt),
            endsAt: toDateInput(promotion.endsAt),
          }
        : createDefaults(),
    );
  }, [promotion, isOpen, reset]);

  const submit = (values: PromotionFormValues) => {
    const normalized = { ...values, description: values.description ?? "" };
    const base: Promotion = promotion ?? {
      id: `promo-${Date.now()}`,
      gradient: DEFAULT_GRADIENT,
      used: 0,
      revenue: 0,
      featured: false,
      ...normalized,
    };
    onSubmit({
      ...base,
      ...normalized,
      startsAt: toIso(values.startsAt),
      endsAt: toIso(values.endsAt),
    });
    toast.success(isEditing ? `${values.code} updated` : `${values.code} created`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent radius="3xl" scroll>
        <DialogHeader className="text-left">
          <DialogTitle className="text-heading tracking-tight">
            {isEditing ? "Edit promotion" : "New promotion"}
          </DialogTitle>
          <DialogDescription className="text-caption text-muted-foreground">
            {isEditing
              ? "Update the reward, schedule, and distribution for this program."
              : "Create a discount program, coupon code, or tier reward."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
          <PromotionFormFields register={register} control={control} errors={errors} />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outlined" shape="circle" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" shape="circle" size="sm">
              {isEditing ? "Save changes" : "Create promotion"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
