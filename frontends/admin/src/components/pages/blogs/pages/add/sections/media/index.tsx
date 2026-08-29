"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/inputs/button";
import { Card } from "@/components/ui/data-display/card";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import { ImageSearchDialog } from "@/components/pages/blogs/sections/image-search-dialog";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { uploadProjectMedia, type ProjectMedia } from "@/lib/admin/services";

type MediaSectionProps = {
  /** Право на медиа проекта: без него подбор изображения не показывается. */
  canManageMedia?: boolean;
};

type ImageSlot = "cover" | "banner";

/**
 * Изображения поста: файл уходит в медиатеку проекта, в форме остаётся ссылка
 * платформы и идентификатор медиа. Подбор изображения открывается по праву на медиа.
 */
export function MediaSection({ canManageMedia = false }: MediaSectionProps) {
  const t = useConsoleText();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<BlogFormValues>();

  const thumbnail = watch("thumbnail");
  const banner = watch("banner");
  const title = watch("title");
  const [pickerSlot, setPickerSlot] = React.useState<ImageSlot | null>(null);

  const urlField = (slot: ImageSlot) => (slot === "cover" ? "thumbnail" : "banner");
  const idField = (slot: ImageSlot) => (slot === "cover" ? "coverMediaId" : "bannerMediaId");

  const apply = (slot: ImageSlot, media: ProjectMedia | null) => {
    setValue(urlField(slot), media?.url ?? "", { shouldValidate: true, shouldDirty: true });
    setValue(idField(slot), media?.id ?? null, { shouldDirty: true });
  };

  const handleUpload = (slot: ImageSlot) => async (file: File) => {
    const media = await uploadProjectMedia(file);
    setValue(idField(slot), media.id, { shouldDirty: true });
    return media.url;
  };

  const handleChange = (slot: ImageSlot) => (images: string[]) => {
    if (images.length === 0) {
      apply(slot, null);
      return;
    }
    setValue(urlField(slot), images[0], { shouldValidate: true, shouldDirty: true });
  };

  const pickAction = (slot: ImageSlot) =>
    canManageMedia ? (
      <Button
        type="button"
        variant="outlined"
        shape="circle"
        size="sm"
        startIcon={<Sparkles />}
        onClick={() => setPickerSlot(slot)}
        data-testid={`image-pick-${slot}`}
      >
        {t("console.images.pick")}
      </Button>
    ) : undefined;

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
            onChange={handleChange("cover")}
            onUpload={handleUpload("cover")}
            uploadErrorText={t("console.images.upload-failed")}
            action={pickAction("cover")}
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
            onChange={handleChange("banner")}
            onUpload={handleUpload("banner")}
            uploadErrorText={t("console.images.upload-failed")}
            action={pickAction("banner")}
            maxFiles={1}
            multiple={false}
            placeholder={t("console.blogs.form.banner-upload")}
            description={t("console.blogs.form.banner-hint")}
            error={errors.banner?.message}
            aspectRatio="video"
          />
        </div>
      </div>

      <ImageSearchDialog
        open={pickerSlot !== null}
        initialQuery={title ?? ""}
        onClose={() => setPickerSlot(null)}
        onPick={(media) => pickerSlot && apply(pickerSlot, media)}
      />
    </Card>
  );
}
