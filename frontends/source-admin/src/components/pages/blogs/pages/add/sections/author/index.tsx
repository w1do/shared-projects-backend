"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { useConsoleText } from "@/lib/admin/use-console-text";

export function AuthorSection() {
  const t = useConsoleText();
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<BlogFormValues>();
  const avatar = watch("authorAvatar");

  return (
    <Card variant="form-section">
      <h2 className="text-sm font-semibold text-foreground leading-tight">
        {t("console.blogs.form.author-title")}
      </h2>
      <Input
        label={t("console.blogs.form.author-name")}
        error={errors.authorName?.message}
        {...register("authorName")}
      />
      <Input
        label={t("console.blogs.form.author-role")}
        error={errors.authorRole?.message}
        {...register("authorRole")}
      />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          {t("console.blogs.form.author-avatar")}
        </span>
        <ImageUploader
          value={avatar ? [avatar] : []}
          onChange={(images) => setValue("authorAvatar", images[0] || "", { shouldValidate: true })}
          maxFiles={1}
          multiple={false}
          placeholder={t("console.blogs.form.avatar-upload")}
          description={t("console.blogs.form.avatar-hint")}
          error={errors.authorAvatar?.message}
          aspectRatio="square"
          previewClassName="aspect-square w-24"
        />
      </div>
    </Card>
  );
}
