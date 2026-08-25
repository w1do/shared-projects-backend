import { CampaignsHeaderSkeleton } from "./header/CampaignsHeaderSkeleton";
import { CampaignsGridSkeleton } from "./panel/CampaignsGridSkeleton";
import { CampaignsToolbarSkeleton } from "./panel/CampaignsToolbarSkeleton";
import { CampaignsStatsSkeleton } from "./stats/CampaignsStatsSkeleton";

/**
 * Full-page campaigns skeleton that mirrors CampaignsPage layout nesting.
 * Shown while useCampaignsPage / useCampaignsQuery is pending (mock delay or API latency).
 * Real page siblings: header, stats, filter toolbar, card grid (all under gap-8).
 */
export function CampaignsLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <CampaignsHeaderSkeleton />
      <CampaignsStatsSkeleton />
      <CampaignsToolbarSkeleton />
      <CampaignsGridSkeleton />
    </div>
  );
}
