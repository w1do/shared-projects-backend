"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { LAYOUT_OPTIONS } from "@/components/pages/blogs/pages/add/constants";
import { FormSelectField } from "@/components/pages/blogs/pages/add/components/FormSelectField";

export function StatusSection() {
  const {
    register,
    formState: { errors },
  } = useFormContext<BlogFormValues>();

  return (
    <Card variant="form-section">
      <h2 className="text-sm font-semibold text-foreground leading-tight">Publish settings</h2>
      <Input
        label="Reading time (min)"
        type="number"
        error={errors.readingTimeMin?.message}
        {...register("readingTimeMin")}
      />
      <FormSelectField
        name="layoutStyle"
        label="Layout style"
        options={LAYOUT_OPTIONS}
        ariaLabel="Layout style"
        error={errors.layoutStyle?.message}
      />
    </Card>
  );
}
