"use client";

import { useFormContext } from "react-hook-form";
import { CalendarRange } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";
import type { CampaignLaunchTemplate } from "@/lib/admin/campaigns/launch-templates";

type LaunchDetailsStepProps = {
  selectedTemplate?: CampaignLaunchTemplate | null;
};

export function LaunchDetailsStep({ selectedTemplate }: LaunchDetailsStepProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext<CampaignFormValues>();

  return (
    <div className="flex flex-col gap-6">
      {selectedTemplate && (
        <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-4 text-caption text-muted-foreground">
          Template · <span className="font-semibold text-foreground">{selectedTemplate.title}</span>
          {" · "}
          {selectedTemplate.channel || "No channel"} · ${selectedTemplate.budget.toLocaleString()}
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card p-6">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-brand-accent">
            <CalendarRange className="size-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Set the launch window</h3>
            <p className="mt-2 text-caption text-muted-foreground">
              Only the schedule is editable in Launch. Channel, budget, promotions, and collections
              stay locked from the template.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            type="date"
            {...register("startsAt")}
            label="Start date"
            error={errors.startsAt?.message}
          />
          <Input
            type="date"
            {...register("endsAt")}
            label="End date"
            error={errors.endsAt?.message}
          />
        </div>
      </div>
    </div>
  );
}
