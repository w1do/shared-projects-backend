import { Skeleton } from "@/components/ui/data-display/skeleton";

const FILTER_PILL_COUNT = 5;

/** Mirrors campaigns filter bar: status pills (All/Active/Scheduled/Completed/Draft) + search. */
export function CampaignsToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: FILTER_PILL_COUNT }, (_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <Skeleton className="h-10 w-full rounded-full sm:w-72" />
    </div>
  );
}
