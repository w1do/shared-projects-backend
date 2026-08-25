import { InventoryFooterSkeleton } from "./InventoryFooterSkeleton";
import { InventoryTableSkeleton } from "./InventoryTableSkeleton";
import { InventoryToolbarSkeleton } from "./InventoryToolbarSkeleton";

/**
 * Panel-only skeleton (toolbar + table + footer).
 * Used when the page shell is already mounted but inventory data is still pending.
 */
export function InventoryPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <InventoryToolbarSkeleton />
      <InventoryTableSkeleton />
      <InventoryFooterSkeleton />
    </div>
  );
}
