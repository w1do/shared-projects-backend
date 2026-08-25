"use client";

import React from "react";
import { Card } from "@/components/ui/data-display/card";
import { CollectionSelector } from "./CollectionSelector";
import { PromotionSelector } from "./PromotionSelector";

export function LinkedResourcesSection() {
  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">Linked Resources</h2>
        <p className="text-xs text-muted-foreground-lighter">
          Select target Collections and discount Promotions that will run during this marketing
          campaign.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Collections Selector */}
        <CollectionSelector />

        {/* Promotions Selector */}
        <PromotionSelector />
      </div>
    </Card>
  );
}
