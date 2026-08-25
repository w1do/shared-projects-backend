import { CollectionsFooterSkeleton } from "./CollectionsFooterSkeleton";
import { CollectionsTableSkeleton } from "./CollectionsTableSkeleton";
import { CollectionsToolbarSkeleton } from "./CollectionsToolbarSkeleton";

/**
 * Panel-only skeleton (toolbar + default table + footer).
 * Default viewMode on CollectionsPanel is table with 8 rows per page.
 */
export function CollectionsPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <CollectionsToolbarSkeleton />
      <CollectionsTableSkeleton />
      <CollectionsFooterSkeleton />
    </div>
  );
}
