import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Mirrors RevenueChart card: header, metric tabs, period totals, chart area. */
export function RevenueChartSkeleton() {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-28" />
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Chart plot area ~280px → nearest 8px grid utility */}
      <Skeleton className="mt-6 h-72 w-full rounded-lg" />
    </div>
  );
}
