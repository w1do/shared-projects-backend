import { Skeleton } from "@/components/ui/data-display/skeleton";

const CARD_COUNT = 4;

/** Mirrors campaigns list grid + CampaignCard (md: 2-col, no pagination footer). */
export function CampaignsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {Array.from({ length: CARD_COUNT }, (_, index) => (
        <div
          key={index}
          className="relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-2"
        >
          <div className="relative aspect-banner w-full overflow-hidden bg-muted">
            <Skeleton className="size-full rounded-none" />
            <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
            </div>
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="size-12 shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-6 w-48 max-w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>

            <div className="mt-2 flex items-center gap-8 border-t border-border/40 pt-2">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-24" />
              <div className="flex-1" />
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-10" />
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              <Skeleton className="h-8 w-40 rounded-lg" />
              <div className="flex-1" />
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
