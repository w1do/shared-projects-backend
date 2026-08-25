import { Skeleton } from "@/components/ui/data-display/skeleton";

/**
 * Mirrors BlogsFeatured: 2-col editorial hero (banner + body with badges,
 * title, subtitle, author row, and primary/action controls).
 */
export function BlogsFeaturedSkeleton() {
  return (
    <div className="grid overflow-hidden rounded-3xl border border-border/60 bg-background shadow-subtle-3 lg:grid-cols-2">
      <div className="aspect-video relative overflow-hidden bg-muted lg:h-full">
        <Skeleton className="size-full rounded-none" />
      </div>

      <div className="flex flex-col justify-between gap-6 p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full max-w-md" />
            <Skeleton className="h-8 w-3/5 max-w-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <Skeleton className="size-10 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-col gap-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-40 shrink-0" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-36 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
