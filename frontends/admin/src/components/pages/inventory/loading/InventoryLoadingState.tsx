import { InventoryHeaderSkeleton } from "./header/InventoryHeaderSkeleton";
import { InventoryPanelSkeleton } from "./panel/InventoryPanelSkeleton";
import { InventoryStatsSkeleton } from "./stats/InventoryStatsSkeleton";

/**
 * Full-page inventory skeleton that mirrors InventoryPage layout nesting.
 * Shown while useInventoryPage / useInventoryQuery is pending (mock delay or API latency).
 */
export function InventoryLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <InventoryHeaderSkeleton />
      <InventoryStatsSkeleton />
      <InventoryPanelSkeleton />
    </div>
  );
}
