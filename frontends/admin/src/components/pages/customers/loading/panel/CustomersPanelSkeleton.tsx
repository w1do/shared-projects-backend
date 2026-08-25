import { CustomersFooterSkeleton } from "./CustomersFooterSkeleton";
import { CustomersTableSkeleton } from "./CustomersTableSkeleton";
import { CustomersToolbarSkeleton } from "./CustomersToolbarSkeleton";

/**
 * Panel-only skeleton (toolbar + table + footer).
 * Default CustomersPanel uses table view with 8 rows per page.
 */
export function CustomersPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <CustomersToolbarSkeleton />
      <CustomersTableSkeleton />
      <CustomersFooterSkeleton />
    </div>
  );
}
