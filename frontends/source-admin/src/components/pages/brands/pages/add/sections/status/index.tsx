"use client";

import { useFormContext } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Switch } from "@/components/ui/inputs/switch";
import { Select } from "@/components/ui/inputs/select";
import { Label } from "@/components/ui/inputs/label";
import { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";

const statusOptions = ["Draft", "Active", "Archived"] as const;

export function StatusSection() {
  const { watch, setValue } = useFormContext<BrandFormValues>();
  const status = watch("status") || "Active";
  const isFeatured = watch("isFeatured") || false;

  return (
    <Card variant="form-section">
      {/* Brand Status */}
      <Select
        label="Publish Status"
        labelClassName="text-muted-foreground"
        value={status}
        options={statusOptions.map((opt) => ({ value: opt, label: opt }))}
        onChange={(e) =>
          setValue("status", e.target.value as "Draft" | "Active" | "Archived", {
            shouldValidate: true,
          })
        }
      />

      {/* Featured Toggle */}
      <div className="flex items-center justify-between py-1 border-y border-border/40">
        <div>
          <Label htmlFor="brand-featured" className="text-xs font-semibold text-foreground block">
            Featured Brand
          </Label>
          <span className="text-caption text-muted-foreground-lighter">
            Showcase on homepage and store menus
          </span>
        </div>
        <Switch
          id="brand-featured"
          checked={isFeatured}
          onCheckedChange={(checked) => setValue("isFeatured", checked, { shouldValidate: true })}
        />
      </div>
    </Card>
  );
}
