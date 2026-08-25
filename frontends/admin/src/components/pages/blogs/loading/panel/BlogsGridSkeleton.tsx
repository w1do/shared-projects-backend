import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Default BlogsPanel page size (itemsPerPage = 8). */
const CARD_COUNT = 8;

/**
 * Mirrors BlogsPanel article grid + ArticleCard (default 8 per page,
 * 1/2/3/4-col responsive).
 */
export function BlogsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <div
          key={index}
          className="relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-subtle-3"
        >
          <div className="aspect-thumb relative overflow-hidden bg-muted">
            <Skeleton className="size-full rounded-none" />
            <div className="absolute left-4 top-4 z-10">
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/5" />
            </div>

            <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/50 pt-4">
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-col gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-12 shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
