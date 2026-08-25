"use client";

import React from "react";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { getCampaignCapabilities } from "@/lib/admin/services";
import { useCreateCampaignForm } from "@/hooks/admin/campaigns";
import { useStickyThreshold } from "@/hooks/use-sticky-threshold";
import {
  campaignFormSchema,
  defaultCampaignFormValues,
  sampleCampaignFormValues,
  type CampaignFormValues,
} from "@/lib/admin/schemas/content/campaign-form-schema";

// Sections
import { AddCampaignHeader } from "./sections/header";
import { AddCampaignStickyHeader } from "./sections/sticky-header";
import { GeneralInfoSection } from "./sections/general-info";
import { VisualSection } from "./sections/visual";
import { LinkedResourcesSection } from "./sections/linked-resources";

export function AddCampaignForm() {
  const isSticky = useStickyThreshold();
  const { submit, isSubmitting } = useCreateCampaignForm();

  const methods = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema) as Resolver<CampaignFormValues>,
    defaultValues: defaultCampaignFormValues,
  });

  const onSubmit = async (data: CampaignFormValues) => {
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  const handleAutoFill = () => {
    if (!getCampaignCapabilities().autoFill) {
      toast.info("Auto-fill is only available in mock template mode.");
      return;
    }
    methods.reset(sampleCampaignFormValues);
    toast.success("Auto-filled with a sample campaign (Summer Aromatherapy Edit)");
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <AddCampaignStickyHeader
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          onAutoFill={handleAutoFill}
        />

        <div className="flex flex-col gap-8">
          <AddCampaignHeader isSubmitting={isSubmitting} onAutoFill={handleAutoFill} />

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - 2 spans */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              <GeneralInfoSection />
              <LinkedResourcesSection />
            </div>

            {/* Right Column - 1 span */}
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-6 lg:sticky lg:top-32">
                <VisualSection />
              </div>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
export default AddCampaignForm;
