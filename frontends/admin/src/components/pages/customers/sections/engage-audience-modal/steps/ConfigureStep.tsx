"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { Textarea } from "@/components/ui/inputs/textarea";
import type { Campaign } from "@/lib/admin/mocks/types";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import type { EngageAudienceFormValues } from "@/lib/admin/schemas/content/engage-audience-schema";
import { engageChannelOptions } from "../types";
import { ConfigureAssetPicker } from "./ConfigureAssetPicker";

type ConfigureStepProps = {
  campaigns: Campaign[];
  promotions: Promotion[];
  coupons: Promotion[];
};

export function ConfigureStep({ campaigns, promotions, coupons }: ConfigureStepProps) {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<EngageAudienceFormValues>();

  const intent = useWatch({ control, name: "intent" });
  const campaignId = useWatch({ control, name: "campaignId" });
  const promotionId = useWatch({ control, name: "promotionId" });
  const loyaltyTier = useWatch({ control, name: "loyaltyTier" });

  return (
    <div className="flex flex-col gap-6">
      <ConfigureAssetPicker
        intent={intent}
        campaigns={campaigns}
        promotions={promotions}
        coupons={coupons}
        campaignId={campaignId}
        promotionId={promotionId}
        loyaltyTier={loyaltyTier}
        campaignError={errors.campaignId?.message}
        promotionError={errors.promotionId?.message}
        loyaltyError={errors.loyaltyTier?.message}
        onSelectCampaign={(campaign) => {
          setValue("campaignId", campaign.id, { shouldValidate: true });
          setValue("subject", `You're invited: ${campaign.name}`, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
        onSelectPromotion={(promo, kind) => {
          setValue("promotionId", promo.id, { shouldValidate: true });
          setValue(
            "subject",
            kind === "coupon" ? `Your code: ${promo.code}` : `Exclusive offer: ${promo.title}`,
            { shouldValidate: true, shouldDirty: true },
          );
        }}
        onSelectLoyaltyTier={(tier) => {
          setValue("loyaltyTier", tier, { shouldValidate: true });
          setValue("subject", `You're invited to ${tier}`, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="channel"
          control={control}
          render={({ field }) => (
            <Select
              label="Channel"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              options={engageChannelOptions}
              error={errors.channel?.message}
            />
          )}
        />
        <Input
          type="date"
          label="Schedule date (optional)"
          error={errors.scheduleAt?.message}
          {...register("scheduleAt")}
        />
      </div>

      <Input
        label="Subject line"
        placeholder="A note from Aetheria…"
        error={errors.subject?.message}
        {...register("subject")}
      />

      <Textarea
        label="Message (optional)"
        placeholder="Add a short note customers will see with this outreach."
        rows={4}
        error={errors.message?.message}
        {...register("message")}
      />
    </div>
  );
}
