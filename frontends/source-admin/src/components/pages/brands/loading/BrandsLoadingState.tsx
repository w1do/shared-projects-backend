import { BrandsHeaderSkeleton } from "./header/BrandsHeaderSkeleton";
import { BrandsPanelSkeleton } from "./panel/BrandsPanelSkeleton";
import { BrandsStatsSkeleton } from "./stats/BrandsStatsSkeleton";

/**
 * Full-page brands skeleton that mirrors BrandsPage layout nesting.
 * Shown while useBrandsPage / useBrandsQuery is pending (mock delay or API latency).
 */
export function BrandsLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <BrandsHeaderSkeleton />
      <BrandsStatsSkeleton />
      <BrandsPanelSkeleton />
    </div>
  );
}
