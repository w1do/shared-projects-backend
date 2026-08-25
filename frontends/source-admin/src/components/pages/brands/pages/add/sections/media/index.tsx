"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import { Label } from "@/components/ui/inputs/label";
import { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";

export function BrandMediaSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<BrandFormValues>();

  const logoValue = watch("logo") || [];
  const bannerValue = watch("banner") || [];

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium text-foreground leading-tight">Visual Assets</h2>
        <p className="text-xs text-muted-foreground-lighter">
          Upload brand logotype emblem and storefront marketing banner
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-xs font-medium text-muted-foreground block mb-2">
            Brand Logo / Emblem
          </Label>
          <ImageUploader
            value={logoValue}
            onChange={(val) => setValue("logo", val, { shouldValidate: true })}
            maxFiles={1}
            multiple={false}
            placeholder="Drag & drop brand logo here"
            description="Recommended landscape layout (2:1 aspect ratio, PNG with transparent background)"
            error={errors.logo?.message}
            aspectRatio="logo"
            previewClassName="aspect-logo max-w-64 w-full"
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground block mb-2">
            Brand Cover Banner
          </Label>
          <ImageUploader
            value={bannerValue}
            onChange={(val) => setValue("banner", val, { shouldValidate: true })}
            maxFiles={1}
            multiple={false}
            placeholder="Drag & drop brand banner here"
            description="Recommended landscape layout (19:6 aspect ratio, JPEG/WEBP for optimal performance)"
            error={errors.banner?.message}
            aspectRatio="banner"
            previewClassName="aspect-banner w-full"
          />
        </div>
      </div>
    </Card>
  );
}
