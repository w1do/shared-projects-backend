"use client";

import { useQuery } from "@tanstack/react-query";
import type { Campaign } from "@/lib/admin/mocks/types";
import { listCampaigns } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type UseCampaignsQueryOptions = {
  /** Optional seed (tests/SSR). Prefer omitting so isPending drives the skeleton. */
  initialData?: Campaign[];
  enabled?: boolean;
};

export function useCampaignsQuery(options: UseCampaignsQueryOptions = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.campaigns.list(),
    queryFn: listCampaigns,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
