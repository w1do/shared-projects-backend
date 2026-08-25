"use client";

import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Card } from "@/components/ui/data-display/card";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Select } from "@/components/ui/inputs/select";
import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";

const statusOptions = [
  { value: "Active", label: "Active" },
  { value: "Scheduled", label: "Scheduled" },
  { value: "Completed", label: "Completed" },
  { value: "Draft", label: "Draft" },
];

export function GeneralInfoSection() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<CampaignFormValues>();

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">Campaign Details</h2>
        <p className="text-xs text-muted-foreground-lighter">
          Provide basic marketing goals, channel selection, schedule timelines, and budget
          allocations.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          {...register("name")}
          label="Campaign Name"
          placeholder="e.g. Summer Aromatherapy Edit"
          error={errors.name?.message}
        />

        <Textarea
          {...register("description")}
          label="Description"
          placeholder="Describe the marketing story, creative theme, and campaign goals..."
          className="min-h-20"
          error={errors.description?.message}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register("channel")}
            label="Marketing Channel"
            placeholder="e.g. Email + TikTok"
            error={errors.channel?.message}
          />

          <Input
            type="number"
            {...register("budget", { valueAsNumber: true })}
            label="Allocated Budget ($)"
            placeholder="5000"
            error={errors.budget?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="date"
            {...register("startsAt")}
            label="Start Date"
            error={errors.startsAt?.message}
          />

          <Input
            type="date"
            {...register("endsAt")}
            label="End Date"
            error={errors.endsAt?.message}
          />
        </div>

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
