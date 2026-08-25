import { ProductsFooterSkeleton } from "./ProductsFooterSkeleton";
import { ProductsGridSkeleton } from "./ProductsGridSkeleton";
import { ProductsToolbarSkeleton } from "./ProductsToolbarSkeleton";

/**
 * Panel-only skeleton (toolbar + default grid + footer).
 * Used when the page shell is already mounted but catalog data is still pending.
 */
export function ProductsPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <ProductsToolbarSkeleton />
      <ProductsGridSkeleton />
      <ProductsFooterSkeleton />
    </div>
  );
}
