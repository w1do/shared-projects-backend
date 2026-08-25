"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import { Tooltip } from "@/components/ui/overlay/tooltip";

export interface AvatarGroupItem {
  id: string;
  /** Image URL. Falls back to a gradient swatch or initials when absent. */
  src?: string;
  alt?: string;
  /** Short label (initials/brand) shown when there is no image. */
  fallback?: string;
  /** Gradient [start, end] used for the fallback swatch. */
  gradient?: readonly [string, string];
  /** Tooltip content shown on hover. */
  tooltip?: React.ReactNode;
}

type AvatarGroupSize = "sm" | "md" | "lg";

export interface AvatarGroupProps {
  items: AvatarGroupItem[];
  /** Maximum avatars before collapsing the rest into a "+N" chip. */
  max?: number;
  size?: AvatarGroupSize;
  /** Tooltip layout passed to each avatar (and the overflow chip). */
  tooltipVariant?: "default" | "rich";
  /** Text tone for initials shown over a gradient swatch. */
  gradientTextTone?: "ink" | "paper";
  /** Tooltip shown on the overflow chip. */
  overflowTooltip?: React.ReactNode;
  /** Rendered when there are no items. Hidden when omitted. */
  emptyLabel?: string;
}

const sizeClasses: Record<AvatarGroupSize, string> = {
  sm: "size-6 text-caption",
  md: "size-8 text-caption",
  lg: "size-12 text-body",
};

const gradientTextToneClass: Record<"ink" | "paper", string> = {
  ink: "text-foreground",
  paper: "text-primary-foreground",
};

const circleClasses =
  "flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-background shadow-sm";

export function AvatarGroup({
  items,
  max = 3,
  size = "md",
  tooltipVariant = "default",
  gradientTextTone = "ink",
  overflowTooltip,
  emptyLabel,
}: AvatarGroupProps) {
  const baseId = React.useId();
  const sizeClass = sizeClasses[size];

  if (items.length === 0) {
    return emptyLabel ? (
      <span className="text-caption italic text-muted-foreground-lighter">{emptyLabel}</span>
    ) : null;
  }

  const visibleItems = items.slice(0, max);
  const overflowCount = items.length - visibleItems.length;

  const gradients = visibleItems
    .filter((item) => !item.src && item.gradient)
    .map((item) => ({
      id: `${baseId}-${item.id}`,
      start: item.gradient![0],
      end: item.gradient![1],
    }));

  return (
    <div className="flex items-center">
      {gradients.length > 0 && <AdminDynamicStyles gradients={gradients} />}
      <div className="flex -space-x-2 overflow-hidden">
        {visibleItems.map((item) => {
          const gradientId = !item.src && item.gradient ? `${baseId}-${item.id}` : undefined;
          return (
            <Tooltip key={item.id} title={item.tooltip} variant={tooltipVariant}>
              <div className={cn(circleClasses, sizeClass, "bg-muted font-bold text-foreground")}>
                {item.src ? (
                  <img
                    src={item.src}
                    alt={item.alt ?? item.fallback ?? ""}
                    className="size-full object-cover"
                  />
                ) : gradientId ? (
                  <div
                    className={cn(
                      "admin-gradient-swatch flex size-full items-center justify-center",
                      gradientTextToneClass[gradientTextTone],
                    )}
                    data-admin-gradient={gradientId}
                  >
                    {item.fallback}
                  </div>
                ) : (
                  item.fallback
                )}
              </div>
            </Tooltip>
          );
        })}
        {overflowCount > 0 && (
          <Tooltip title={overflowTooltip} variant={tooltipVariant}>
            <div
              className={cn(
                circleClasses,
                sizeClass,
                "bg-primary font-semibold text-primary-foreground",
              )}
            >
              +{overflowCount}
            </div>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
