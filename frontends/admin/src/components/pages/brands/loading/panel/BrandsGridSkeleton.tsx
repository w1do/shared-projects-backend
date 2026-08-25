import { Skeleton } from "@/components/ui/data-display/skeleton";

const CARD_COUNT = 8;

/** Mirrors BrandsGrid + BrandCard (optional; default list view is table). */
export function BrandsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <div
          key={index}
          className="relative flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-subtle"
        >
          <div className="flex items-start justify-between gap-4">
            <Skeleton className="h-12 w-20 shrink-0 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="mt-6 flex grow flex-col gap-2">
            <Skeleton className="h-6 w-32 max-w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
