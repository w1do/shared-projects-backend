"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { cn } from "@/lib/utils";

type SelectableCardTone = "accent" | "primary";
type SelectableCardAlign = "start" | "center";

type SelectableCardProps = {
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
  /** Selected border/background treatment. */
  tone?: SelectableCardTone;
  /** Cross-axis alignment for the card shell content. */
  align?: SelectableCardAlign;
};

/**
 * Full-width selectable card shell built on design-system Button.
 * Encapsulates selection visuals so callers avoid raw button className shells.
 */
export function SelectableCard({
  selected,
  onSelect,
  children,
  tone = "accent",
  align = "start",
}: SelectableCardProps) {
  const isPrimaryTone = tone === "primary";

  return (
    <Button
      type="button"
      onClick={onSelect}
      variant={selected && isPrimaryTone ? "soft" : "outlined"}
      color={selected ? (isPrimaryTone ? "primary" : "secondary") : "surface"}
      size="auto"
      fullWidth
      aria-pressed={selected}
      data-state={selected ? "selected" : "unselected"}
      className={cn(
        "h-auto justify-start whitespace-normal rounded-2xl border p-4 text-left font-normal shadow-none active:scale-100",
        align === "center" ? "items-center" : "items-start",
        !selected &&
          "border-border/60 bg-card text-foreground hover:border-brand-accent/40 hover:bg-accent/30",
        selected &&
          !isPrimaryTone &&
          "border-brand-accent bg-card text-foreground ring-2 ring-brand-accent/20 hover:border-brand-accent hover:bg-accent/30",
        selected &&
          isPrimaryTone &&
          "border-primary bg-primary/5 text-foreground hover:border-primary hover:bg-primary/5",
      )}
    >
      {children}
    </Button>
  );
}

type SelectableCardCheckProps = {
  selected: boolean;
};

/** Circular selection indicator used inside selectable cards. */
export function SelectableCardCheck({ selected }: SelectableCardCheckProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full border",
        selected
          ? "border-brand-accent bg-brand-accent text-primary-foreground"
          : "border-border text-muted-foreground",
      )}
    >
      {selected ? <Check className="size-4" /> : null}
    </span>
  );
}
