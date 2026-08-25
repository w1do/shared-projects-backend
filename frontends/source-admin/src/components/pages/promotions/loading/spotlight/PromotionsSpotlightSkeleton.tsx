import { Skeleton } from "@/components/ui/data-display/skeleton";

/**
 * Mirrors PromotionsSpotlight ticket layout:
 * reward stub | perforated seam | details (badges, copy, schedule, progress, actions).
 */
export function PromotionsSpotlightSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 md:flex-row">
      <div className="flex min-w-52 flex-col justify-between gap-6 border-b border-border/60 bg-muted/40 p-8 md:border-b-0">
        <Skeleton className="h-4 w-20" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-16 w-32 max-w-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>

      <div className="relative hidden border-l-2 border-dashed border-border md:block">
        <span className="absolute size-notch rounded-full bg-background top-notch-offset left-1/2 -translate-x-1/2" />
        <span className="absolute size-notch rounded-full bg-background bottom-notch-offset left-1/2 -translate-x-1/2" />
      </div>

      <div className="flex flex-1 flex-col justify-between gap-6 p-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-full max-w-prose" />
            <Skeleton className="h-4 w-4/5 max-w-prose" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-48 max-w-full" />
            <Skeleton className="h-4 w-32 shrink-0" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
