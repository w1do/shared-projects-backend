"use client";

import React from "react";
import { Badge } from "@/components/ui/data-display/badge";
import { usePromotionsQuery } from "@/hooks/admin/promotions";

const promoStatusColorMap = {
  Active: "success",
  Scheduled: "warning",
  Completed: "surface",
  Draft: "surface",
} as const;

interface PromotionsListProps {
  promotionIds: string[];
}

export function PromotionsList({ promotionIds }: PromotionsListProps) {
  const { data: promotions = [] } = usePromotionsQuery();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption text-muted-foreground uppercase tracking-wider font-semibold">
        Linked Promotions
      </span>
      <div className="flex flex-col gap-2">
        {promotionIds.map((promoId) => {
          const promoObj = promotions.find((item) => item.id === promoId);
          if (!promoObj) return null;
          const status = (promoObj.status as keyof typeof promoStatusColorMap) || "Draft";
          return (
            <div
              key={promoId}
              className="flex items-center justify-between p-4 border border-border/60 rounded-2xl bg-card"
            >
              <div className="flex min-w-0 flex-col gap-2 pr-4">
                <span className="truncate font-mono text-xs font-semibold text-foreground">
                  {promoObj.code}
                </span>
                <span className="truncate text-caption text-muted-foreground-lighter">
                  {promoObj.title}
                </span>
              </div>
              <Badge
                variant="contained"
                color={promoStatusColorMap[status]}
                shape="circle"
                size="sm"
                className="shrink-0"
              >
                {status}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
