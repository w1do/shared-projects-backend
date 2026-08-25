import { OrdersFooterSkeleton } from "./OrdersFooterSkeleton";
import { OrdersTableSkeleton } from "./OrdersTableSkeleton";
import { OrdersToolbarSkeleton } from "./OrdersToolbarSkeleton";

/**
 * Panel-only skeleton (status tabs + filters + default table + footer).
 * Default OrdersPanel page size is 8 rows (table-first, no grid view).
 */
export function OrdersPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <OrdersToolbarSkeleton />
      <OrdersTableSkeleton />
      <OrdersFooterSkeleton />
    </div>
  );
}
