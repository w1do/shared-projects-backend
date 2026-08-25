import { BrandsFooterSkeleton } from "./BrandsFooterSkeleton";
import { BrandsTableSkeleton } from "./BrandsTableSkeleton";
import { BrandsToolbarSkeleton } from "./BrandsToolbarSkeleton";

/**
 * Panel-only skeleton (toolbar + default table + footer).
 * Default BrandsPanel viewMode is "table" with 8 rows per page.
 */
export function BrandsPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <BrandsToolbarSkeleton />
      <BrandsTableSkeleton />
      <BrandsFooterSkeleton />
    </div>
  );
}
