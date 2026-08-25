import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Group sizes mirror a typical day split (Today + Earlier). */
const FEED_GROUPS = [3, 2] as const;

interface NotificationItemSkeletonProps {
  showAction?: boolean;
}

/** Single feed row: type icon, title/time, description, optional action link. */
function NotificationItemSkeleton({ showAction = false }: NotificationItemSkeletonProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-transparent p-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-4 w-40 max-w-full" />
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="size-2 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-4 w-full max-w-md" />
        {showAction ? <Skeleton className="mt-2 h-4 w-20" /> : null}
      </div>
    </div>
  );
}

/**
 * Mirrors NotificationsFeed: date group labels + card stacks of notification rows.
 */
export function NotificationsFeedSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      {FEED_GROUPS.map((itemCount, groupIndex) => (
        <div key={groupIndex} className="flex flex-col gap-4">
          <Skeleton className="h-4 w-16" />
          <div className="flex flex-col gap-2 rounded-3xl border border-border/60 bg-card p-2 shadow-subtle-3">
            {Array.from({ length: itemCount }, (_, itemIndex) => (
              <NotificationItemSkeleton
                key={itemIndex}
                showAction={itemIndex === 0 || itemIndex === itemCount - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
