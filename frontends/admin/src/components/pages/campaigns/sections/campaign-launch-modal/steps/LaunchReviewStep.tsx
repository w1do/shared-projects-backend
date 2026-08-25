"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { useFormContext, useWatch } from "react-hook-form";
import { CalendarRange, Layers, Megaphone, Tag, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { usePromotionsQuery } from "@/hooks/admin/promotions";
import { useCollectionsQuery } from "@/hooks/admin/collections";
import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";
import type { CampaignLaunchTemplate } from "@/lib/admin/campaigns/launch-templates";

type LaunchReviewStepProps = {
  selectedTemplate?: CampaignLaunchTemplate | null;
};

export function LaunchReviewStep({ selectedTemplate }: LaunchReviewStepProps) {
  const { data: promotionCatalog = [] } = usePromotionsQuery();
  const { data: collectionCatalog = [] } = useCollectionsQuery();
  const { control } = useFormContext<CampaignFormValues>();
  const values = useWatch({ control });

  const promotions = (values.promotionIds ?? [])
    .map((id) => promotionCatalog.find((promo) => promo.id === id))
    .filter(Boolean);
  const collections = (values.collectionIds ?? [])
    .map((id) => collectionCatalog.find((collection) => collection.id === id))
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
        <div className="flex items-start gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
            {values.thumbnail || values.banner ? (
              <Image
                src={values.thumbnail || values.banner || ""}
                alt=""
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <Megaphone className="size-4" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-foreground">
                {values.name || selectedTemplate?.title || "Untitled campaign"}
              </p>
              {selectedTemplate?.badge ? (
                <Badge variant="soft" color="secondary" shape="circle" size="sm">
                  {selectedTemplate.badge}
                </Badge>
              ) : null}
            </div>
            <p className="line-clamp-2 text-caption text-muted-foreground-lighter">
              {values.description || "No description"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReviewRow
          icon={<Megaphone className="size-4" />}
          label="Channel"
          value={values.channel || "—"}
        />
        <ReviewRow
          icon={<Wallet className="size-4" />}
          label="Budget"
          value={`$${(values.budget ?? 0).toLocaleString()}`}
        />
        <ReviewRow
          icon={<CalendarRange className="size-4" />}
          label="Start date"
          value={values.startsAt || "—"}
        />
        <ReviewRow
          icon={<CalendarRange className="size-4" />}
          label="End date"
          value={values.endsAt || "—"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-caption font-semibold text-muted-foreground">
            <Tag className="size-4" />
            Promotions
          </div>
          {promotions.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {promotions.map((promo) => (
                <li key={promo!.id} className="truncate text-caption text-foreground">
                  {promo!.code} · {promo!.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-caption text-muted-foreground-lighter">None linked</p>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-caption font-semibold text-muted-foreground">
            <Layers className="size-4" />
            Collections
          </div>
          {collections.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {collections.map((collection) => (
                <li key={collection!.id} className="truncate text-caption text-foreground">
                  {collection!.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-caption text-muted-foreground-lighter">None linked</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-brand-accent/30 bg-accent/40 p-4 text-caption text-foreground">
        Confirm this snapshot before shipping. <span className="font-semibold">Launch now</span>{" "}
        goes live today; <span className="font-semibold">Schedule</span> keeps the selected start
        date.
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
