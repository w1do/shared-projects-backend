import { OrdersHeaderSkeleton } from "./header/OrdersHeaderSkeleton";
import { OrdersPanelSkeleton } from "./panel/OrdersPanelSkeleton";
import { OrdersStatsSkeleton } from "./stats/OrdersStatsSkeleton";

/**
 * Full-page orders skeleton that mirrors OrdersPage layout nesting.
 * Shown while useOrdersPage / useOrdersQuery is pending (mock delay or API latency).
 */
export function OrdersLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <OrdersHeaderSkeleton />
      <OrdersStatsSkeleton />
      <OrdersPanelSkeleton />
    </div>
  );
}
