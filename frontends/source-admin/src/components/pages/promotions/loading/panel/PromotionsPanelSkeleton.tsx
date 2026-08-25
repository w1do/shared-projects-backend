import { PromotionsFooterSkeleton } from "./PromotionsFooterSkeleton";
import { PromotionsTableSkeleton } from "./PromotionsTableSkeleton";
import { PromotionsToolbarSkeleton } from "./PromotionsToolbarSkeleton";

/**
 * Panel-only skeleton (toolbar + default table + footer).
 * Default PromotionsPanel viewMode is "table" with 8 rows per page.
 */
export function PromotionsPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <PromotionsToolbarSkeleton />
      <PromotionsTableSkeleton />
      <PromotionsFooterSkeleton />
    </div>
  );
}
