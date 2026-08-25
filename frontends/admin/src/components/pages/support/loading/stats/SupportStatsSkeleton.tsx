import { Skeleton } from "@/components/ui/data-display/skeleton";

const STAT_COUNT = 4;

/**
 * Mirrors SupportStats: 4 KpiStatCards in a responsive grid
 * (label + icon tile, value + delta, sparkline placeholder).
 */
export function SupportStatsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: STAT_COUNT }, (_, index) => (
        <div
          key={index}
          className="flex flex-col justify-between rounded-3xl border border-border/60 bg-card p-6 shadow-subtle-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="size-12 shrink-0 rounded-full" />
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-10 w-32 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
