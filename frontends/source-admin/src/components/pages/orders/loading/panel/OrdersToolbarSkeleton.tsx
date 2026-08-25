import { Skeleton } from "@/components/ui/data-display/skeleton";

/** STATUS_TABS length: all, Paid, Processing, Shipped, Refunded, Pending. */
const STATUS_TAB_COUNT = 6;

/**
 * Mirrors OrdersPanel controls: underline status tabs with count badges,
 * then search input + payment/value filter selects.
 */
export function OrdersToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/40 pb-2">
        {Array.from({ length: STATUS_TAB_COUNT }, (_, index) => (
          <div key={index} className="flex items-center gap-2 px-2 py-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-6 rounded-full" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="w-full max-w-sm">
          <Skeleton className="h-10 w-full rounded-full" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-10 w-40 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
