"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";

export function MediaSection() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<BlogFormValues>();
  const thumbnail = watch("thumbnail");
  const banner = watch("banner");

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium text-foreground leading-tight">Media</h2>
        <p className="text-xs text-muted-foreground-lighter">
          Cover imagery shown on the blog grid and article header
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Thumbnail</span>
          <ImageUploader
            value={thumbnail ? [thumbnail] : []}
            onChange={(images) => setValue("thumbnail", images[0] || "", { shouldValidate: true })}
            maxFiles={1}
            multiple={false}
            placeholder="Upload thumbnail"
            description="Square card visual used across the blog grid"
            error={errors.thumbnail?.message}
            aspectRatio="square"
            previewClassName="aspect-square w-48"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Banner</span>
          <ImageUploader
            value={banner ? [banner] : []}
            onChange={(images) => setValue("banner", images[0] || "", { shouldValidate: true })}
            maxFiles={1}
            multiple={false}
            placeholder="Upload banner"
            description="Wide hero image shown on the article header"
            error={errors.banner?.message}
            aspectRatio="video"
          />
        </div>
      </div>
    </Card>
  );
}
