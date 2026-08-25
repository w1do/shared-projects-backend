import { CampaignsGridSkeleton } from "./CampaignsGridSkeleton";
import { CampaignsToolbarSkeleton } from "./CampaignsToolbarSkeleton";

/**
 * Panel-only skeleton (toolbar + default card grid).
 * Campaigns list has no pagination footer; default body is the 2-col card grid.
 */
export function CampaignsPanelSkeleton() {
  return (
    <>
      <CampaignsToolbarSkeleton />
      <CampaignsGridSkeleton />
    </>
  );
}
