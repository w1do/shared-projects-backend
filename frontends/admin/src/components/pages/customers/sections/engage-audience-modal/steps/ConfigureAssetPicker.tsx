"use client";

import type { Campaign } from "@/lib/admin/mocks/types";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import type { EngageAudienceFormValues } from "@/lib/admin/schemas/content/engage-audience-schema";
import { SelectableEntityCard } from "../components/SelectableEntityCard";
import { loyaltyTierOptions } from "../types";
import { t } from "@/lib/admin/console-texts";

type ConfigureAssetPickerProps = {
  intent: EngageAudienceFormValues["intent"];
  campaigns: Campaign[];
  promotions: Promotion[];
  coupons: Promotion[];
  campaignId?: string;
  promotionId?: string;
  loyaltyTier?: EngageAudienceFormValues["loyaltyTier"];
  campaignError?: string;
  promotionError?: string;
  loyaltyError?: string;
  onSelectCampaign: (campaign: Campaign) => void;
  onSelectPromotion: (promo: Promotion, kind: "promotion" | "coupon") => void;
  onSelectLoyaltyTier: (tier: NonNullable<EngageAudienceFormValues["loyaltyTier"]>) => void;
};

export function ConfigureAssetPicker({
  intent,
  campaigns,
  promotions,
  coupons,
  campaignId,
  promotionId,
  loyaltyTier,
  campaignError,
  promotionError,
  loyaltyError,
  onSelectCampaign,
  onSelectPromotion,
  onSelectLoyaltyTier,
}: ConfigureAssetPickerProps) {
  if (intent === "campaign") {
    return (
      <AssetSection
        label={t("console.engage.asset.campaign")}
        error={campaignError}
        emptyMessage={t("console.engage.asset.campaign-empty")}
      >
        {campaigns.map((campaign) => (
          <SelectableEntityCard
            key={campaign.id}
            title={campaign.name}
            subtitle={campaign.description || campaign.channel}
            meta={campaign.status}
            badge={campaign.channel}
            selected={campaignId === campaign.id}
            onSelect={() => onSelectCampaign(campaign)}
          />
        ))}
      </AssetSection>
    );
  }

  if (intent === "promotion") {
    return (
      <AssetSection
        label={t("console.engage.asset.promotion")}
        error={promotionError}
        emptyMessage={t("console.engage.asset.promotion-empty")}
      >
        {promotions.map((promo) => (
          <SelectableEntityCard
            key={promo.id}
            title={promo.title}
            subtitle={`${promo.code} · ${promo.type}`}
            meta={promo.status}
            badge={promo.channel}
            selected={promotionId === promo.id}
            onSelect={() => onSelectPromotion(promo, "promotion")}
          />
        ))}
      </AssetSection>
    );
  }

  if (intent === "coupon") {
    return (
      <AssetSection
        label={t("console.engage.asset.coupon")}
        error={promotionError}
        emptyMessage={t("console.engage.asset.coupon-empty")}
      >
        {coupons.map((promo) => (
          <SelectableEntityCard
            key={promo.id}
            title={promo.code}
            subtitle={promo.title}
            meta={`${promo.type} · ${promo.status}`}
            badge={promo.channel}
            selected={promotionId === promo.id}
            onSelect={() => onSelectPromotion(promo, "coupon")}
          />
        ))}
      </AssetSection>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption font-semibold text-muted-foreground">
        {t("console.engage.asset.loyalty")}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {loyaltyTierOptions.map((tier) => (
          <SelectableEntityCard
            key={tier.value}
            title={tier.label}
            subtitle={t("console.engage.asset.loyalty-subtitle")}
            selected={loyaltyTier === tier.value}
            onSelect={() =>
              onSelectLoyaltyTier(
                tier.value as NonNullable<EngageAudienceFormValues["loyaltyTier"]>,
              )
            }
          />
        ))}
      </div>
      {loyaltyError ? (
        <p className="text-caption font-medium text-destructive">{loyaltyError}</p>
      ) : null}
    </div>
  );
}

function AssetSection({
  label,
  error,
  emptyMessage,
  children,
}: {
  label: string;
  error?: string;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children : [children];
  const hasItems = items.filter(Boolean).length > 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-caption font-semibold text-muted-foreground">{label}</p>
      {hasItems ? (
        children
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-center text-caption text-muted-foreground">
          {emptyMessage}
        </div>
      )}
      {error ? <p className="text-caption font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
