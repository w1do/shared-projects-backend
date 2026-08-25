"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";
import type { Campaign } from "@/lib/admin/mocks/types";
import { createCampaign, deleteCampaign, updateCampaign } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type QueryClient = ReturnType<typeof useQueryClient>;

function setCampaignsCache(queryClient: QueryClient, campaigns: Campaign[]) {
  queryClient.setQueryData<Campaign[]>(adminQueryKeys.campaigns.list(), campaigns);
}

export function useCreateCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CampaignFormValues) => createCampaign(values),
    onSuccess: (campaign) => {
      queryClient.setQueryData<Campaign[]>(adminQueryKeys.campaigns.list(), (current = []) => {
        const without = current.filter((item) => item.id !== campaign.id);
        return [campaign, ...without];
      });
      queryClient.setQueryData(adminQueryKeys.campaigns.detail(campaign.id), campaign);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.campaigns.all });
    },
  });
}

export function useUpdateCampaignMutation(campaignId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CampaignFormValues) => updateCampaign(campaignId, values),
    onSuccess: (campaign) => {
      if (!campaign) return;
      queryClient.setQueryData<Campaign[]>(adminQueryKeys.campaigns.list(), (current = []) =>
        current.map((item) => (item.id === campaign.id ? campaign : item)),
      );
      queryClient.setQueryData(adminQueryKeys.campaigns.detail(campaign.id), campaign);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.campaigns.all });
    },
  });
}

export function useDeleteCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCampaign(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.campaigns.all });
      const previous = queryClient.getQueryData<Campaign[]>(adminQueryKeys.campaigns.list());
      queryClient.setQueryData<Campaign[]>(adminQueryKeys.campaigns.list(), (current = []) =>
        current.filter((campaign) => campaign.id !== id),
      );
      queryClient.removeQueries({ queryKey: adminQueryKeys.campaigns.detail(id) });
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) setCampaignsCache(queryClient, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.campaigns.all });
    },
  });
}
