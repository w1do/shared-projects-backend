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
import { useConsoleText } from "@/lib/admin/use-console-text";
import { customerTierLabel } from "@/components/pages/customers/utils";

type ConfigureStepProps = {
  campaigns: Campaign[];
  promotions: Promotion[];
  coupons: Promotion[];
};

export function ConfigureStep({ campaigns, promotions, coupons }: ConfigureStepProps) {
  const t = useConsoleText();
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
          setValue(
            "subject",
            t("console.engage.subject.campaign").replace("{name}", campaign.name),
            {
              shouldValidate: true,
              shouldDirty: true,
            },
          );
        }}
        onSelectPromotion={(promo, kind) => {
          setValue("promotionId", promo.id, { shouldValidate: true });
          setValue(
            "subject",
            kind === "coupon"
              ? t("console.engage.subject.coupon").replace("{code}", promo.code)
              : t("console.engage.subject.promotion").replace("{name}", promo.title),
            { shouldValidate: true, shouldDirty: true },
          );
        }}
        onSelectLoyaltyTier={(tier) => {
          setValue("loyaltyTier", tier, { shouldValidate: true });
          setValue(
            "subject",
            t("console.engage.subject.loyalty").replace("{tier}", customerTierLabel(tier)),
            {
              shouldValidate: true,
              shouldDirty: true,
            },
          );
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Controller
          name="channel"
          control={control}
          render={({ field }) => (
            <Select
              label={t("console.engage.form.channel")}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              options={engageChannelOptions}
              error={errors.channel?.message}
            />
          )}
        />
        <Input
          type="date"
          label={t("console.engage.form.schedule-date")}
          error={errors.scheduleAt?.message}
          {...register("scheduleAt")}
        />
      </div>

      <Input
        label={t("console.engage.form.subject")}
        placeholder={t("console.engage.form.subject-placeholder")}
        error={errors.subject?.message}
        {...register("subject")}
      />

      <Textarea
        label={t("console.engage.form.message")}
        placeholder={t("console.engage.form.message-placeholder")}
        rows={4}
        error={errors.message?.message}
        {...register("message")}
      />
    </div>
  );
}
