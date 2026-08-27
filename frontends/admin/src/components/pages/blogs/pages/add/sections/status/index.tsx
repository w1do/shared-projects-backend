"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { LAYOUT_OPTIONS } from "@/components/pages/blogs/pages/add/constants";
import { FormSelectField } from "@/components/pages/blogs/pages/add/components/FormSelectField";

export function StatusSection() {
  const t = useConsoleText();
  const {
    register,
    formState: { errors },
  } = useFormContext<BlogFormValues>();

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
    </Card>
  );
}
