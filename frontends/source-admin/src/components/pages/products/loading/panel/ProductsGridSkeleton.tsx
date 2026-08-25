import { Skeleton } from "@/components/ui/data-display/skeleton";

const CARD_COUNT = 8;

/** Mirrors ProductsGrid + AdminProductCard (default viewMode is grid, 8 per page). */
export function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <div
          key={index}
          className="relative flex flex-col overflow-hidden rounded-3xl border border-border/40 bg-card shadow-subtle"
        >
          <div className="absolute top-4 left-4 z-10">
            <Skeleton className="size-6 rounded-full" />
          </div>

          <div className="relative aspect-square overflow-hidden border-b border-border/20 bg-muted">
            <Skeleton className="size-full rounded-none" />
            <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 p-6">
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-full max-w-48" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-border/30 pt-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
