import { ProductsHeaderSkeleton } from "./header/ProductsHeaderSkeleton";
import { ProductsPanelSkeleton } from "./panel/ProductsPanelSkeleton";
import { ProductsStatsSkeleton } from "./stats/ProductsStatsSkeleton";

/**
 * Full-page products skeleton that mirrors ProductsPage layout nesting.
 * Shown while useProductsPage / useProductsQuery is pending (mock delay or API latency).
 */
export function ProductsLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <ProductsHeaderSkeleton />
      <ProductsStatsSkeleton />
      <ProductsPanelSkeleton />
    </div>
  );
}
