import { Skeleton } from "@/components/ui/data-display/skeleton";

const KPI_COUNT = 4;

/**
 * Mirrors PromotionsStats: 4 KpiStatCard tiles (label + icon, value + delta + sparkline).
 */
export function PromotionsStatsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: KPI_COUNT }, (_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between rounded-3xl border border-border/60 bg-card p-6 shadow-subtle-3"
        >
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-32 max-w-full" />
            <Skeleton className="size-12 shrink-0 rounded-full" />
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-36 max-w-full" />
            </div>
            <Skeleton className="h-10 w-32 shrink-0 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
