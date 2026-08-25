"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";

export function AuthorSection() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<BlogFormValues>();
  const avatar = watch("authorAvatar");

  return (
    <Card variant="form-section">
      <h2 className="text-sm font-semibold text-foreground leading-tight">Author</h2>
      <Input label="Name" error={errors.authorName?.message} {...register("authorName")} />
      <Input label="Role" error={errors.authorRole?.message} {...register("authorRole")} />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground">Avatar</span>
        <ImageUploader
          value={avatar ? [avatar] : []}
          onChange={(images) => setValue("authorAvatar", images[0] || "", { shouldValidate: true })}
          maxFiles={1}
          multiple={false}
          placeholder="Upload avatar"
          description="Square headshot of the author"
          error={errors.authorAvatar?.message}
          aspectRatio="square"
          previewClassName="aspect-square w-24"
        />
      </div>
    </Card>
  );
}
