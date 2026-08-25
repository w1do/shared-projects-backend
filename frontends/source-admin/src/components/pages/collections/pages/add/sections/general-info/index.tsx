"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Select } from "@/components/ui/inputs/select";
import type { CollectionFormValues } from "@/lib/admin/schemas/catalog/collection-form-schema";

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Draft", label: "Draft" },
  { value: "Archived", label: "Archived" },
];

export function GeneralInfoSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CollectionFormValues>();

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">
          Collection Details
        </h2>
        <p className="text-xs text-muted-foreground-lighter">
          Name the edit and describe the story shoppers will see. The handle is generated
          automatically.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          {...register("name")}
          label="Collection Name"
          placeholder="e.g., Midnight Recovery Edit"
          error={errors.name?.message}
        />

        <Textarea
          {...register("description")}
          label="Description"
          placeholder="Describe the story and edit of this collection..."
          className="min-h-20"
          error={errors.description?.message}
        />

        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select
              label="Status"
              value={field.value}
              options={statusOptions}
              onChange={(e) => field.onChange(e.target.value)}
              error={errors.status?.message}
            />
          )}
        />
      </div>
    </Card>
  );
}
