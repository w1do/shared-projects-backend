"use client";

import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { CalendarRange, Mail, Megaphone, Tag, Users } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import type { Campaign } from "@/lib/admin/mocks/types";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import type { EngageAudienceFormValues } from "@/lib/admin/schemas/content/engage-audience-schema";
import { intentOptions } from "../types";

type ReviewStepProps = {
  customers: DetailedCustomer[];
  campaigns: Campaign[];
  promotions: Promotion[];
};

export function ReviewStep({ customers, campaigns, promotions }: ReviewStepProps) {
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
    assetLabel = values.loyaltyTier ? `${values.loyaltyTier} tier` : "—";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-foreground">{intentMeta?.title ?? "Outreach"}</p>
          {intentMeta?.badge ? (
            <Badge variant="soft" color="secondary" shape="circle" size="sm">
              {intentMeta.badge}
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 text-caption text-muted-foreground">
          {intentMeta?.description ?? "Review the payload before sending."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReviewRow
          icon={<Users className="size-4" />}
          label="Audience"
          value={`${customers.length} customer${customers.length === 1 ? "" : "s"}`}
        />
        <ReviewRow icon={<Megaphone className="size-4" />} label="Asset" value={assetLabel} />
        <ReviewRow
          icon={<Mail className="size-4" />}
          label="Channel"
          value={values.channel || "—"}
        />
        <ReviewRow
          icon={<CalendarRange className="size-4" />}
          label="Schedule"
          value={values.scheduleAt || "Send now"}
        />
        <ReviewRow
          icon={<Tag className="size-4" />}
          label="Subject"
          value={values.subject || "—"}
        />
      </div>

      {values.message ? (
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-caption font-semibold text-muted-foreground">Message</p>
          <p className="mt-2 whitespace-pre-wrap text-caption text-foreground">{values.message}</p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <p className="mb-2 text-caption font-semibold text-muted-foreground">Recipients preview</p>
        <ul className="flex flex-col gap-2">
          {customers.slice(0, 5).map((customer) => (
            <li key={customer.id} className="truncate text-caption text-foreground">
              {customer.name} · {customer.email}
            </li>
          ))}
          {customers.length > 5 ? (
            <li className="text-caption text-muted-foreground-lighter">
              +{customers.length - 5} more
            </li>
          ) : null}
        </ul>
      </div>

      <div className="rounded-2xl border border-dashed border-brand-accent/30 bg-accent/40 p-4 text-caption text-foreground">
        Confirm this snapshot before shipping. <span className="font-semibold">Send</span> delivers
        immediately; <span className="font-semibold">Schedule</span> keeps the selected date.
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
