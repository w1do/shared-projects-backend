"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import { Label } from "@/components/ui/inputs/label";
import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";

export function VisualSection() {
  const { control } = useFormContext<CampaignFormValues>();

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">Media & Visuals</h2>
        <p className="text-xs text-muted-foreground-lighter">
          Upload both a square thumbnail for cards/tables and a wide cover banner for landing
          heroes.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Controller
          control={control}
          name="thumbnail"
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground block">
                Thumbnail Image (1:1)
              </Label>
              <ImageUploader
                value={field.value ? [field.value] : []}
                onChange={(images) => field.onChange(images[0] || "")}
                maxFiles={1}
                multiple={false}
                placeholder="Upload thumbnail image"
                description="Square brand asset displayed in search results and card grids (1:1)"
                aspectRatio="square"
                previewClassName="aspect-square w-full max-w-48"
                error={error?.message}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="banner"
          render={({ field, fieldState: { error } }) => (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground block">
                Cover Banner (19:6)
              </Label>
              <ImageUploader
                value={field.value ? [field.value] : []}
                onChange={(images) => field.onChange(images[0] || "")}
                maxFiles={1}
                multiple={false}
                placeholder="Upload cover banner"
                description="Wide design displayed across active slots on storefront hero (19:6)"
                aspectRatio="banner"
                previewClassName="aspect-banner w-full"
                error={error?.message}
              />
            </div>
          )}
        />
      </div>
    </Card>
  );
}
