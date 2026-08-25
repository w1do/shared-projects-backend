import { BlogsFooterSkeleton } from "./BlogsFooterSkeleton";
import { BlogsGridSkeleton } from "./BlogsGridSkeleton";
import { BlogsToolbarSkeleton } from "./BlogsToolbarSkeleton";

/**
 * Panel-only skeleton (search/category toolbar + default card grid + footer).
 * Default BlogsPanel page size is 8 cards.
 */
export function BlogsPanelSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <BlogsToolbarSkeleton />
      <BlogsGridSkeleton />
      <BlogsFooterSkeleton />
    </div>
  );
}
