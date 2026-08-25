import { Skeleton } from "@/components/ui/data-display/skeleton";

const CAMPAIGN_ROW_COUNT = 4;

/** Mirrors CampaignPerformance: header + bordered campaign rows with progress. */
export function CampaignPerformanceSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-12 rounded-full" />
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-4">
        {Array.from({ length: CAMPAIGN_ROW_COUNT }, (_, index) => (
          <div key={index} className="rounded-2xl border border-border/70 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="mt-2 h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
