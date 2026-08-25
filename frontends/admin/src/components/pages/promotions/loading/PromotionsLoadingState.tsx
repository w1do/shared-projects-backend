import { PromotionsHeaderSkeleton } from "./header/PromotionsHeaderSkeleton";
import { PromotionsPanelSkeleton } from "./panel/PromotionsPanelSkeleton";
import { PromotionsSpotlightSkeleton } from "./spotlight/PromotionsSpotlightSkeleton";
import { PromotionsStatsSkeleton } from "./stats/PromotionsStatsSkeleton";

/**
 * Full-page promotions skeleton that mirrors PromotionsPage layout nesting.
 * Shown while usePromotionsPage / usePromotionsQuery is pending (mock delay or API latency).
 */
export function PromotionsLoadingState() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-live="polite">
      <PromotionsHeaderSkeleton />
      <PromotionsStatsSkeleton />
      <PromotionsSpotlightSkeleton />
      <PromotionsPanelSkeleton />
    </div>
  );
}
