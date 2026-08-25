"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";

export function BrandThumbnailSection() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<BrandFormValues>();

  const thumbnail = watch("thumbnail");

  return (
    <Card variant="form-section">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground leading-tight">Brand Thumbnail</h3>
        <p className="text-xs text-muted-foreground-lighter">
          Primary square visual badge used across brand grid lists
        </p>
      </div>

      <ImageUploader
        value={thumbnail ? [thumbnail] : []}
        onChange={(newImages) =>
          setValue("thumbnail", newImages[0] || "", { shouldValidate: true })
        }
        maxFiles={1}
        multiple={false}
        placeholder="Upload brand thumbnail"
        description="Supports square proportions (1:1 aspect ratio, min 500x500px)"
        error={errors.thumbnail?.message}
        aspectRatio="square"
        previewClassName="aspect-square w-full"
      />
    </Card>
  );
}
