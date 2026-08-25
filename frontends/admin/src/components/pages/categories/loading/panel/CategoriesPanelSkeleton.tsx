import { CategoriesFooterSkeleton } from "./CategoriesFooterSkeleton";
import { CategoriesTableSkeleton } from "./CategoriesTableSkeleton";
import { CategoriesToolbarSkeleton } from "./CategoriesToolbarSkeleton";

/**
 * Panel-only skeleton (toolbar + default table + footer).
 * Default viewMode in useCategoriesPanel is "table", 8 rows per page.
 */
export function CategoriesPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <CategoriesToolbarSkeleton />
      <CategoriesTableSkeleton />
      <CategoriesFooterSkeleton />
    </div>
  );
}
