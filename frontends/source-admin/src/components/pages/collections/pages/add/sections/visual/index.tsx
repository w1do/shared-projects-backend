"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Switch } from "@/components/ui/inputs/switch";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import { Label } from "@/components/ui/inputs/label";
import type { CollectionFormValues } from "@/lib/admin/schemas/catalog/collection-form-schema";

export function VisualSection() {
  const { control } = useFormContext<CollectionFormValues>();

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">Cover & Media</h2>
        <p className="text-xs text-muted-foreground-lighter">
          Upload the banner and thumbnail, and flag featured placement on the storefront.
        </p>
      </div>

      <div className="flex flex-col gap-4">
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
                placeholder="Upload collection thumbnail"
                description="Square badge used across listing grids and tables (1:1)"
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
                Banner Image (19:6)
              </Label>
              <ImageUploader
                value={field.value ? [field.value] : []}
                onChange={(images) => field.onChange(images[0] || "")}
                maxFiles={1}
                multiple={false}
                placeholder="Upload collection banner"
                description="Wide cover shown on storefront collection hero (19:6)"
                aspectRatio="banner"
                previewClassName="aspect-banner w-full"
                error={error?.message}
              />
            </div>
          )}
        />

        <Controller
          control={control}
          name="featured"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/30 px-4 py-2">
              <div className="flex flex-col">
                <Label
                  htmlFor="collection-featured"
                  className="text-xs font-semibold text-foreground"
                >
                  Feature on home screen
                </Label>
                <span className="text-caption text-muted-foreground-lighter">
                  Pin this collection to the storefront hero.
                </span>
              </div>
              <Switch
                id="collection-featured"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </div>
          )}
        />
      </div>
    </Card>
  );
}
