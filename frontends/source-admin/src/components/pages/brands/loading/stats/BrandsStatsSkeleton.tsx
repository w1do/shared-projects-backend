import { Skeleton } from "@/components/ui/data-display/skeleton";

const STAT_CARD_COUNT = 3;
const MARKET_SHARE_LEGEND_COUNT = 4;

/**
 * Mirrors BrandsStats: 3 BrandStatCards + BrandMarketShareCard in a 4-cell grid.
 */
export function BrandsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-background shadow-subtle-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: STAT_CARD_COUNT }, (_, index) => (
        <div
          key={index}
          className="flex items-start justify-between border-b border-r border-border/60 p-6 lg:border-b-0"
        >
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="size-16 shrink-0 rounded-xl" />
        </div>
      ))}

      <div className="flex flex-col justify-between p-6">
        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-4 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-2 w-full rounded-full" />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {Array.from({ length: MARKET_SHARE_LEGEND_COUNT }, (_, index) => (
              <div key={index} className="flex items-center gap-1">
                <Skeleton className="size-2 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
