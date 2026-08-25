import { CustomersHeaderSkeleton } from "./header/CustomersHeaderSkeleton";
import { CustomersPanelSkeleton } from "./panel/CustomersPanelSkeleton";
import { CustomersStatsSkeleton } from "./stats/CustomersStatsSkeleton";

/**
 * Full-page customers skeleton that mirrors CustomersPage layout nesting.
 * Shown while useCustomersPage / useCustomersQuery is pending (mock delay or API latency).
 */
export function CustomersLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <CustomersHeaderSkeleton />
      <CustomersStatsSkeleton />
      <CustomersPanelSkeleton />
    </div>
  );
}
