"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { useConsoleText } from "@/lib/admin/use-console-text";

export function MediaSection() {
  const t = useConsoleText();
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
        <h2 className="text-heading font-medium text-foreground leading-tight">
          {t("console.blogs.form.media-title")}
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          {t("console.blogs.form.media-subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t("console.blogs.form.thumbnail-label")}
          </span>
          <ImageUploader
            value={thumbnail ? [thumbnail] : []}
            onChange={(images) => setValue("thumbnail", images[0] || "", { shouldValidate: true })}
            maxFiles={1}
            multiple={false}
            placeholder={t("console.blogs.form.thumbnail-upload")}
            description={t("console.blogs.form.thumbnail-hint")}
            error={errors.thumbnail?.message}
            aspectRatio="square"
            previewClassName="aspect-square w-48"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t("console.blogs.form.banner-label")}
          </span>
          <ImageUploader
            value={banner ? [banner] : []}
            onChange={(images) => setValue("banner", images[0] || "", { shouldValidate: true })}
            maxFiles={1}
            multiple={false}
            placeholder={t("console.blogs.form.banner-upload")}
            description={t("console.blogs.form.banner-hint")}
            error={errors.banner?.message}
            aspectRatio="video"
          />
        </div>
      </div>
    </Card>
  );
}
