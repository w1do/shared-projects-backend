"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Campaign } from "@/lib/admin/mocks/types";
import { useCampaignsQuery } from "./use-campaigns-query";
import { useDeleteCampaignMutation } from "./use-campaign-mutations";

type UseCampaignsPageOptions = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the catalog list pattern.
   */
  initialCampaigns?: Campaign[];
};

/**
 * Campaigns list page: Query list + filter UI state + delete confirmation.
 * Filter/search stay local UI state; list source is TanStack Query.
 */
export function useCampaignsPage(options: UseCampaignsPageOptions = {}) {
  const { initialCampaigns } = options;
  const hasSeed = initialCampaigns !== undefined;
  const router = useRouter();
  const { data, isPending } = useCampaignsQuery({
    initialData: hasSeed ? initialCampaigns : undefined,
  });
  const campaigns = useMemo(() => data ?? initialCampaigns ?? [], [data, initialCampaigns]);
  const deleteMutation = useDeleteCampaignMutation();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Campaign["status"] | "All">("All");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.channel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = activeFilter === "All" || campaign.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [campaigns, searchQuery, activeFilter]);

  const openLaunch = () => {
    router.push("/admin/campaigns/add");
  };

  const requestDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const cancelDelete = () => {
    if (deleteMutation.isPending) return;
    setDeleteTargetId(null);
  };

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    const id = deleteTargetId;
    setSelectedCampaign(null);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteTargetId(null);
        toast.success("Campaign deleted successfully");
      },
      onError: () => toast.error("Failed to delete campaign"),
    });
  };

  return {
    campaigns,
    filteredCampaigns,
    /** No cached data yet — show full-page CampaignsLoadingState. */
    isPending: hasSeed ? false : isPending,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    selectedCampaign,
    setSelectedCampaign,
    deleteTargetId,
    openLaunch,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
  };
}
