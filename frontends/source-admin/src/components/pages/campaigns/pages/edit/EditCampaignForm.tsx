"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Megaphone } from "lucide-react";
import { useStickyThreshold } from "@/hooks/use-sticky-threshold";
import {
  campaignFormSchema,
  type CampaignFormValues,
} from "@/lib/admin/schemas/content/campaign-form-schema";
import { getCampaignById } from "@/lib/admin/services";
import type { Campaign } from "@/lib/admin/mocks/types";
import { useUpdateCampaignForm } from "@/hooks/admin/campaigns";

// Sections
import { AddCampaignHeader } from "../add/sections/header";
import { AddCampaignStickyHeader } from "../add/sections/sticky-header";
import { GeneralInfoSection } from "../add/sections/general-info";
import { VisualSection } from "../add/sections/visual";
import { LinkedResourcesSection } from "../add/sections/linked-resources";

interface EditCampaignFormProps {
  id: string;
  /** Optional SSR-fetched campaign (API mode or seed). */
  initialCampaign?: Campaign | null;
}

export function EditCampaignForm({ id, initialCampaign = null }: EditCampaignFormProps) {
  const router = useRouter();
  const isSticky = useStickyThreshold();
  const [hasLoaded, setHasLoaded] = useState(Boolean(initialCampaign));
  const { submit, isSubmitting } = useUpdateCampaignForm(id);

  const methods = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema) as Resolver<CampaignFormValues>,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const campaign = (await getCampaignById(id)) ?? initialCampaign;

      if (cancelled) return;

      if (campaign) {
        methods.reset({
          name: campaign.name,
          description: campaign.description || "",
          status: campaign.status || "Draft",
          channel: campaign.channel,
          budget: campaign.budget ?? 0,
          startsAt: campaign.startsAt || "",
          endsAt: campaign.endsAt || "",
          promotionIds: campaign.promotionIds || [],
          collectionIds: campaign.collectionIds || [],
          banner: campaign.banner || "",
          thumbnail: campaign.thumbnail || "",
        });
        setHasLoaded(true);
      } else {
        toast.error("Campaign not found");
        router.push("/admin/campaigns");
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [id, initialCampaign, methods, router]);

  const onSubmit = async (data: CampaignFormValues) => {
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  if (!hasLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-center">
        <Megaphone className="size-8 text-muted-foreground animate-bounce mb-4" />
        <span className="text-xs text-muted-foreground">Loading campaign details...</span>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <AddCampaignStickyHeader
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          title="Edit Campaign"
          submitLabel="Save Campaign"
        />

        <div className="flex flex-col gap-8">
          <AddCampaignHeader
            isSubmitting={isSubmitting}
            title="Edit Campaign"
            submitLabel="Save Campaign"
          />

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
export default EditCampaignForm;
