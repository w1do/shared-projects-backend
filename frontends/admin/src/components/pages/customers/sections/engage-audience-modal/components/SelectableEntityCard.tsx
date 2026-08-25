"use client";

import { Badge } from "@/components/ui/data-display/badge";
import { SelectableCard, SelectableCardCheck } from "@/components/shared/layout/SelectableCard";

type SelectableEntityCardProps = {
  title: string;
  subtitle?: string;
  meta?: string;
  badge?: string;
  selected: boolean;
  onSelect: () => void;
};

export function SelectableEntityCard({
  title,
  subtitle,
  meta,
  badge,
  selected,
  onSelect,
}: SelectableEntityCardProps) {
  return (
    <SelectableCard selected={selected} onSelect={onSelect} tone="primary" align="center">
      <SelectableCardCheck selected={selected} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-semibold text-foreground">{title}</p>
          {badge ? (
            <Badge variant="soft" color="secondary" shape="circle" size="sm">
              {badge}
            </Badge>
          ) : null}
        </div>
        {subtitle ? (
          <p className="mt-2 truncate text-caption text-muted-foreground">{subtitle}</p>
        ) : null}
        {meta ? (
          <p className="mt-2 truncate text-caption text-muted-foreground-lighter">{meta}</p>
        ) : null}
      </div>
    </SelectableCard>
  );
}
