"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";

export function ThumbnailSection() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const thumbnail = watch("thumbnail");

  return (
    <Card variant="form-section">
      <h3 className="text-sm font-semibold text-foreground leading-tight">Product Thumbnail</h3>

      <ImageUploader
        value={thumbnail ? [thumbnail] : []}
        onChange={(newImages) =>
          setValue("thumbnail", newImages[0] || "", { shouldValidate: true })
        }
        maxFiles={1}
        multiple={false}
        placeholder="Upload thumbnail"
        description="Primary visual badge used across catalog listing grids"
        error={errors.thumbnail?.message}
        aspectRatio="square"
        previewClassName="aspect-square w-full"
      />
    </Card>
  );
}
