import { BlogsFeaturedSkeleton } from "./featured/BlogsFeaturedSkeleton";
import { BlogsHeaderSkeleton } from "./header/BlogsHeaderSkeleton";
import { BlogsPanelSkeleton } from "./panel/BlogsPanelSkeleton";
import { BlogsStatsSkeleton } from "./stats/BlogsStatsSkeleton";

/**
 * Full-page blogs skeleton that mirrors BlogsPage layout nesting.
 * Shown while useBlogsPage / useArticlesQuery is pending (mock delay or API latency).
 * Real page siblings: header, stats, featured hero, panel (all under gap-10).
 */
export function BlogsLoadingState() {
  return (
    <div className="flex flex-col gap-10" aria-busy="true" aria-live="polite">
      <BlogsHeaderSkeleton />
      <BlogsStatsSkeleton />
      <BlogsFeaturedSkeleton />
      <BlogsPanelSkeleton />
    </div>
  );
}
