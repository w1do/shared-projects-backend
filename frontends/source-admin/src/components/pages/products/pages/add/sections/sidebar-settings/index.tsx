"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Select } from "@/components/ui/inputs/select";
import type { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export type ProductSelectOption = {
  value: string;
  label: string;
};

export function SidebarSettings({
  brandOptions = [],
  categoryOptions = [],
}: {
  brandOptions?: ProductSelectOption[];
  categoryOptions?: ProductSelectOption[];
}) {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();

  const brand = watch("brand");
  const category = watch("category");

  return (
    <Card variant="form-section">
      <h3 className="text-sm font-semibold text-foreground leading-tight">Organization</h3>

      <Select
        label="Brand"
        labelClassName="text-caption font-medium text-foreground/70"
        placeholder="Select brand"
        options={brandOptions}
        value={brand}
        onChange={(e) => setValue("brand", e.target.value, { shouldValidate: true })}
        error={errors.brand?.message}
      />

      <Select
        label="Category"
        labelClassName="text-caption font-medium text-foreground/70"
        placeholder="Select category"
        options={categoryOptions}
        value={category}
        onChange={(e) => setValue("category", e.target.value, { shouldValidate: true })}
        error={errors.category?.message}
      />
    </Card>
  );
}
