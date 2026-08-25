"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Select } from "@/components/ui/inputs/select";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

const statusOptions = ["Draft", "Active", "Archived"];

export function StatusSection() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ProductFormValues>();
  const status = watch("status");

  return (
    <Card variant="form-section">
      <Select
        label="Status"
        labelClassName="text-sm font-semibold text-foreground leading-tight"
        placeholder="Select status"
        options={statusOptions}
        value={status}
        onChange={(e) =>
          setValue("status", e.target.value as "Draft" | "Active" | "Archived", {
            shouldValidate: true,
          })
        }
        error={errors.status?.message}
      />
    </Card>
  );
}
