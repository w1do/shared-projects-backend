import { Skeleton } from "@/components/ui/data-display/skeleton";

const CARD_COUNT = 8;

/** Mirrors CollectionsPanel grid + CollectionCard (md: 2-col, 8 per page). */
export function CollectionsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <div
          key={index}
          className="relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3"
        >
          <div className="relative">
            <div className="relative aspect-banner w-full overflow-hidden bg-muted">
              <Skeleton className="size-full rounded-none" />
              <div className="absolute right-4 top-4 z-10">
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="absolute left-4 top-4 z-10">
                <Skeleton className="size-8 rounded-full" />
              </div>
            </div>
            <div className="absolute -bottom-16 right-16 size-36 overflow-hidden rounded-2xl border-2 border-card bg-muted shadow-md">
              <Skeleton className="size-full rounded-none" />
            </div>
          </div>

          <div className="flex flex-1 flex-col p-6 pt-6">
            <Skeleton className="h-8 w-48 max-w-full" />
            <Skeleton className="mt-2 h-4 w-32" />
            <div className="mt-4 flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
