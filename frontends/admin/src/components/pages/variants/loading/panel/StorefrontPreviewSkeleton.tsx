import { Skeleton } from "@/components/ui/data-display/skeleton";

const OPTION_PILL_COUNT = 4;

/** Mirrors StorefrontPreview card: live header, thumb + meta, option pills. */
export function StorefrontPreviewSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-4 shadow-subtle-3">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="size-24 shrink-0 rounded-xl" />
          <div className="flex min-h-20 min-w-0 flex-1 flex-col justify-between">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-border/60 pt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: OPTION_PILL_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-8 w-16 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
