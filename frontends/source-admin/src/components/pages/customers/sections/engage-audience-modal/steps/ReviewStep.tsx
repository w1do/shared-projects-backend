"use client";

import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { CalendarRange, Mail, Megaphone, Tag, Users } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import type { Campaign } from "@/lib/admin/mocks/types";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import type { EngageAudienceFormValues } from "@/lib/admin/schemas/content/engage-audience-schema";
import { engageChannelLabel, intentOptions } from "../types";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { customerTierLabel } from "@/components/pages/customers/utils";

type ReviewStepProps = {
  customers: DetailedCustomer[];
  campaigns: Campaign[];
  promotions: Promotion[];
};

export function ReviewStep({ customers, campaigns, promotions }: ReviewStepProps) {
  const t = useConsoleText();
  const { control } = useFormContext<EngageAudienceFormValues>();
  const values = useWatch({ control });

  const intentMeta = intentOptions.find((item) => item.id === values.intent);
  const campaign = campaigns.find((item) => item.id === values.campaignId);
  const promotion = promotions.find((item) => item.id === values.promotionId);

  let assetLabel = "—";
  if (values.intent === "campaign") assetLabel = campaign?.name ?? "—";
  if (values.intent === "promotion") assetLabel = promotion?.title ?? "—";
  if (values.intent === "coupon") assetLabel = promotion?.code ?? "—";
  if (values.intent === "loyalty")
    assetLabel = values.loyaltyTier
      ? t("console.engage.review.tier-value").replace(
          "{tier}",
          customerTierLabel(values.loyaltyTier),
        )
      : "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">
            {intentMeta?.title ?? t("console.engage.intent.fallback")}
          </p>
          {intentMeta?.badge ? (
            <Badge variant="soft" color="secondary" shape="circle" size="sm">
              {intentMeta.badge}
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 text-caption text-muted-foreground">
          {intentMeta?.description ?? t("console.engage.intent.fallback-description")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReviewRow
          icon={<Users className="size-4" />}
          label={t("console.engage.review.audience")}
          value={t("console.engage.audience.reach-count").replace(
            "{count}",
            String(customers.length),
          )}
        />
        <ReviewRow
          icon={<Megaphone className="size-4" />}
          label={t("console.engage.review.asset")}
          value={assetLabel}
        />
        <ReviewRow
          icon={<Mail className="size-4" />}
          label={t("console.engage.review.channel")}
          value={values.channel ? engageChannelLabel(values.channel) : "—"}
        />
        <ReviewRow
          icon={<CalendarRange className="size-4" />}
          label={t("console.engage.review.schedule")}
          value={values.scheduleAt || t("console.engage.review.send-now")}
        />
        <ReviewRow
          icon={<Tag className="size-4" />}
          label={t("console.engage.review.subject")}
          value={values.subject || "—"}
        />
      </div>

      {values.message ? (
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-caption font-semibold text-muted-foreground">
            {t("console.engage.review.message")}
          </p>
          <p className="mt-2 whitespace-pre-wrap text-caption text-foreground">{values.message}</p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <p className="mb-2 text-caption font-semibold text-muted-foreground">
          {t("console.engage.review.recipients")}
        </p>
        <ul className="flex flex-col gap-2">
          {customers.slice(0, 5).map((customer) => (
            <li key={customer.id} className="truncate text-caption text-foreground">
              {customer.name} · {customer.email}
            </li>
          ))}
          {customers.length > 5 ? (
            <li className="text-caption text-muted-foreground-lighter">
              {t("console.engage.review.more").replace("{count}", String(customers.length - 5))}
            </li>
          ) : null}
        </ul>
      </div>

      <div className="rounded-2xl border border-dashed border-brand-accent/30 bg-accent/40 p-4 text-caption text-foreground">
        {t("console.engage.review.note-before")}{" "}
        <span className="font-semibold">{t("console.engage.review.note-send")}</span>{" "}
        {t("console.engage.review.note-middle")}{" "}
        <span className="font-semibold">{t("console.engage.review.note-schedule")}</span>{" "}
        {t("console.engage.review.note-after")}
      </div>
    </div>
  );
}

function ReviewRow({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-caption font-semibold text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="truncate text-body font-medium text-foreground">{value}</p>
    </div>
  );
}
