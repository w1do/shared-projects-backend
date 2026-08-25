import { CategoriesHeaderSkeleton } from "./header/CategoriesHeaderSkeleton";
import { CategoriesPanelSkeleton } from "./panel/CategoriesPanelSkeleton";
import { CategoriesStatsSkeleton } from "./stats/CategoriesStatsSkeleton";

/**
 * Full-page categories skeleton that mirrors CategoriesPage layout nesting.
 * Shown while useCategoriesPage / useCategoriesQuery is pending (mock delay or API latency).
 */
export function CategoriesLoadingState() {
  return (
    <div className="flex flex-col gap-8" aria-busy="true" aria-live="polite">
      <CategoriesHeaderSkeleton />
      <CategoriesStatsSkeleton />
      <CategoriesPanelSkeleton />
    </div>
  );
}
