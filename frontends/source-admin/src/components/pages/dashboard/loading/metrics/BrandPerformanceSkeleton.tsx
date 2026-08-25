import { Skeleton } from "@/components/ui/data-display/skeleton";

const BRAND_CARD_COUNT = 6;

/** Mirrors BrandPerformance: header + brand mini-cards with sparklines. */
export function BrandPerformanceSkeleton() {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: BRAND_CARD_COUNT }, (_, index) => (
          <div key={index} className="rounded-2xl border border-border/70 bg-card p-4">
            <div className="flex items-start gap-4">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-28 max-w-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
