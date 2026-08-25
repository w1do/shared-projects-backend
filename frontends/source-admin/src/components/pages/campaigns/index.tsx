"use client";

import { Plus, Megaphone, Search } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { PageHeader } from "@/components/shared/layout/PageHeader";
import type { Campaign } from "@/lib/admin/mocks/types";
import { useCampaignsPage } from "@/hooks/admin/campaigns";
import { CampaignsLoadingState } from "./loading";
import { CampaignsStats } from "./sections/campaigns-stats";
import { CampaignCard } from "./sections/campaign-card";
import { CampaignDetailModal } from "./sections/campaign-detail-modal";
import { CampaignDeleteDialog } from "./sections/campaign-delete-dialog";

interface CampaignsPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  initialCampaigns?: Campaign[];
}

/**
 * Campaigns page — list/filter/delete via useCampaignsPage (TanStack Query).
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function CampaignsPage({ initialCampaigns }: CampaignsPageProps = {}) {
  const {
    campaigns,
    filteredCampaigns,
    isPending,
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
  } = useCampaignsPage(initialCampaigns !== undefined ? { initialCampaigns } : {});

  if (isPending) {
    return <CampaignsLoadingState />;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Campaigns"
        description="Launch and monitor unified marketing campaigns linking curated product collections with dedicated discount codes."
        breadcrumbItems={[
          { label: "Admin", href: "/admin" },
          { label: "Commerce", href: "/admin/orders" },
          { label: "Campaigns" },
        ]}
        actions={
          <Button
            variant="contained"
            shape="circle"
            size="sm"
            startIcon={<Plus />}
            onClick={openLaunch}
          >
            Launch Campaign
          </Button>
        }
      />

      <CampaignsStats campaigns={campaigns} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card border border-border/40 p-4 rounded-2xl">
        <div className="flex flex-wrap gap-2">
          {(["All", "Active", "Scheduled", "Completed", "Draft"] as const).map((filter) => {
            const count =
              filter === "All"
                ? campaigns.length
                : campaigns.filter((c) => (c.status || "Draft") === filter).length;
            return (
              <Button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                variant={activeFilter === filter ? "contained" : "soft"}
                color={activeFilter === filter ? "primary" : "surface"}
                shape="circle"
                size="sm"
              >
                {filter} ({count})
              </Button>
            );
          })}
        </div>

        <Input
          type="text"
          placeholder="Search campaigns..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startIcon={<Search />}
          shape="circle"
          className="w-full sm:w-72"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCampaigns.map((c) => (
          <CampaignCard key={c.id} campaign={c} onClick={() => setSelectedCampaign(c)} />
        ))}

        {filteredCampaigns.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center bg-card border border-dashed border-border/80 rounded-3xl">
            <Megaphone className="size-12 text-muted-foreground-lighter mb-4" />
            <h3 className="font-openrunde text-heading text-foreground">No campaigns found</h3>
            <p className="mt-2 max-w-sm text-xs text-muted-foreground">
              Try adjusting your filters or search keywords, or launch a new campaign from scratch.
            </p>
          </div>
        )}
      </div>

      <CampaignDetailModal
        campaign={selectedCampaign}
        isOpen={!!selectedCampaign}
        onClose={() => setSelectedCampaign(null)}
        onDelete={requestDelete}
      />

      <CampaignDeleteDialog
        open={!!deleteTargetId}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
