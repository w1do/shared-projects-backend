"use client";

import Image from "next/image";
import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { SelectableCard, SelectableCardCheck } from "@/components/shared/layout/SelectableCard";
import type { CampaignLaunchTemplate } from "@/lib/admin/campaigns/launch-templates";

type TemplateCardProps = {
  template: CampaignLaunchTemplate;
  selected: boolean;
  onSelect: () => void;
};

export function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  return (
    <SelectableCard selected={selected} onSelect={onSelect} tone="accent" align="start">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted">
        {template.image ? (
          <Image src={template.image} alt="" fill className="object-cover" sizes="64px" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <Megaphone className="size-4" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{template.title}</p>
            <p className="mt-2 line-clamp-2 text-caption text-muted-foreground">
              {template.tagline}
            </p>
          </div>
          <SelectableCardCheck selected={selected} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {template.badge ? (
            <Badge variant="soft" color="secondary" shape="circle" size="sm">
              {template.badge}
            </Badge>
          ) : null}
          {template.channel ? (
            <span className="text-caption text-muted-foreground-lighter">{template.channel}</span>
          ) : null}
          {template.roas > 0 ? (
            <span className="text-caption font-semibold text-brand-accent">
              {template.roas.toFixed(1)}× ROAS
            </span>
          ) : null}
          {template.budget > 0 ? (
            <span className="text-caption text-muted-foreground">
              ${template.budget.toLocaleString()}
            </span>
          ) : null}
        </div>

        <p className="text-caption text-muted-foreground-lighter">{template.insight}</p>
      </div>
    </SelectableCard>
  );
}
