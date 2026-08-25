"use client";

import { Badge } from "@/components/ui/data-display/badge";
import { SelectableCard, SelectableCardCheck } from "@/components/shared/layout/SelectableCard";
import type { IntentOption } from "../types";

type IntentCardProps = {
  option: IntentOption;
  selected: boolean;
  onSelect: () => void;
};

export function IntentCard({ option, selected, onSelect }: IntentCardProps) {
  return (
    <SelectableCard selected={selected} onSelect={onSelect} tone="accent" align="start">
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate font-semibold text-foreground">{option.title}</p>
            <p className="mt-2 line-clamp-2 text-caption text-muted-foreground">
              {option.description}
            </p>
          </div>
          <SelectableCardCheck selected={selected} />
        </div>
        <Badge variant="soft" color="secondary" shape="circle" size="sm">
          {option.badge}
        </Badge>
      </div>
    </SelectableCard>
  );
}
