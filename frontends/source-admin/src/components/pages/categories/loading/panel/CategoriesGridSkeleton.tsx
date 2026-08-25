import { Skeleton } from "@/components/ui/data-display/skeleton";

const CARD_COUNT = 8;

/**
 * Mirrors CategoryCard grid (md:2 / lg:3). Default list view is table;
 * kept for panel variants that switch to grid.
 */
export function CategoriesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <div
          key={index}
          className="relative flex min-h-20 flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3"
        >
          <div className="relative h-16 w-full overflow-hidden border-b border-border/20 bg-muted">
            <Skeleton className="size-full rounded-none" />
            <div className="absolute top-4 right-4 z-10">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>

          <div className="absolute top-8 left-6">
            <Skeleton className="size-14 rounded-full" />
          </div>

          <div className="flex flex-1 flex-col p-6 pt-12">
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-6 w-40 max-w-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
