"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";
import { useCreateCampaignMutation, useUpdateCampaignMutation } from "./use-campaign-mutations";

export function useCreateCampaignForm() {
  const router = useRouter();
  const createMutation = useCreateCampaignMutation();

  const submit = async (values: CampaignFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Campaign created successfully");
      router.push("/admin/campaigns");
    } catch {
      toast.error("Failed to create campaign.");
      throw new Error("create-campaign-failed");
    }
  };

  return { submit, isSubmitting: createMutation.isPending };
}

export function useUpdateCampaignForm(campaignId: string) {
  const router = useRouter();
  const updateMutation = useUpdateCampaignMutation(campaignId);

  const submit = async (values: CampaignFormValues) => {
    try {
      const updated = await updateMutation.mutateAsync(values);
      if (!updated) {
        toast.error("Campaign not found.");
        return;
      }
      toast.success("Campaign updated successfully");
      router.push("/admin/campaigns");
    } catch {
      toast.error("Failed to update campaign.");
      throw new Error("update-campaign-failed");
    }
  };

  return { submit, isSubmitting: updateMutation.isPending };
}
