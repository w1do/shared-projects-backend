"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Switch } from "@/components/ui/inputs/switch";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { LAYOUT_OPTIONS } from "@/components/pages/blogs/pages/add/constants";
import { FormSelectField } from "@/components/pages/blogs/pages/add/components/FormSelectField";

export function StatusSection() {
  const t = useConsoleText();
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<BlogFormValues>();
  const isFeatured = watch("isFeatured");

  return (
    <Card variant="form-section">
      <h2 className="text-sm font-semibold text-foreground leading-tight">
        {t("console.blogs.form.publish-title")}
      </h2>
      <Input
        label={t("console.blogs.form.reading-time")}
        type="number"
        error={errors.readingTimeMin?.message}
        {...register("readingTimeMin")}
      />
      <FormSelectField
        name="layoutStyle"
        label={t("console.blogs.form.layout-label")}
        options={LAYOUT_OPTIONS}
        ariaLabel={t("console.blogs.form.layout-label")}
        error={errors.layoutStyle?.message}
      />
      <label className="flex items-center gap-4 text-xs text-muted-foreground">
        <Switch
          checked={isFeatured}
          onCheckedChange={(checked) => setValue("isFeatured", checked, { shouldDirty: true })}
          data-testid="post-featured-input"
        />
        {t("console.blogs.form.featured")}
      </label>
    </Card>
  );
}
