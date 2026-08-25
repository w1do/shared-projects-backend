import { Skeleton } from "@/components/ui/data-display/skeleton";

const STAT_CARD_COUNT = 4;

/**
 * Mirrors CampaignsStats: 4 equal metric cells in a bordered 4-col grid
 * (Total Budget, Generated Revenue, Average ROAS, Total Traffic).
 */
export function CampaignsStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: STAT_CARD_COUNT }, (_, index) => (
        <div
          key={index}
          className="flex items-start justify-between border-b border-border/60 p-6 last:border-b-0 sm:even:border-l sm:even:border-border/60 lg:border-b-0 lg:border-l lg:border-border/60 lg:first:border-l-0"
        >
          <div className="flex min-w-0 flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="size-16 shrink-0 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
