"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";

export function SEOSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<BrandFormValues>();

  const brandName = watch("name") || "";
  const metaTitle = watch("metaTitle") || "";
  const metaDescription = watch("metaDescription") || "";

  const previewTitle =
    metaTitle || (brandName ? `${brandName} | Ætheria Beauty` : "Brand Title | Ætheria Beauty");
  const previewSlug = brandName
    ? brandName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    : "brand-name";
  const previewDescription =
    metaDescription ||
    "Discover luxury skincare and couture cosmetics. Experience cellular science and premium beauty formulations.";

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium text-foreground leading-tight">
          SEO & Search Settings
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          Optimize search engine indexing for store listings
        </p>
      </div>

      <div className="bg-muted/40 p-4 rounded-2xl border border-border/60 space-y-2">
        <span className="text-caption text-muted-foreground-lighter block">
          Search Engine Result Preview
        </span>
        <div className="space-y-1">
          <span className="text-caption text-info block truncate">
            https://aetheria.com › brands › {previewSlug}
          </span>
          <span className="font-serif text-sm font-semibold text-primary block hover:underline cursor-pointer truncate">
            {previewTitle}
          </span>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {previewDescription}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Input
          {...register("metaTitle")}
          label="Meta Title"
          placeholder="e.g. HERA Cosmetics | Contemporary Seoul Luxury"
          error={errors.metaTitle?.message}
        />

        <Textarea
          {...register("metaDescription")}
          label="Meta Description"
          placeholder="e.g. Explore HERA's iconic range of high-performance foundations, lipsticks, and serums..."
          error={errors.metaDescription?.message}
        />
      </div>
    </Card>
  );
}
