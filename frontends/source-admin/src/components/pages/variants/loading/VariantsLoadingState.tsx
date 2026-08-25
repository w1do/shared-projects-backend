import { VariantGroupsHeaderSkeleton } from "./header/VariantGroupsHeaderSkeleton";
import { VariantsWorkspaceSkeleton } from "./panel/VariantsWorkspaceSkeleton";
import { VariantGroupsStatsSkeleton } from "./stats/VariantGroupsStatsSkeleton";

/**
 * Full-page variants skeleton that mirrors VariantsPanel layout nesting.
 * Shown while useVariantsPage / useVariantsQuery is pending (mock delay or API latency).
 */
export function VariantsLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <VariantGroupsHeaderSkeleton />
      <VariantGroupsStatsSkeleton />
      <VariantsWorkspaceSkeleton />
    </div>
  );
}
