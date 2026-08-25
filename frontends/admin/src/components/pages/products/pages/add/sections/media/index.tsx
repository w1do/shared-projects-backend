"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";

export function MediaSection() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const images = watch("images") || [];

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium text-foreground leading-tight">Product Imagery</h2>
        <p className="text-xs text-muted-foreground-lighter">
          High-end aesthetic visual assets of your beauty product
        </p>
      </div>

      <ImageUploader
        value={images}
        onChange={(newImages) => setValue("images", newImages, { shouldValidate: true })}
        showPrimary
        error={errors.images?.message}
      />
    </Card>
  );
}
