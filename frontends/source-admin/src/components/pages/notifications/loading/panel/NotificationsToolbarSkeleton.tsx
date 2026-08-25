import { Skeleton } from "@/components/ui/data-display/skeleton";

/**
 * Mirrors notifications filters row: All/Unread ButtonGroup + type Select.
 */
export function NotificationsToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="inline-flex items-center gap-1 rounded-full bg-muted p-1">
        <Skeleton className="h-8 w-12 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
      <Skeleton className="h-10 w-40 rounded-lg" />
    </div>
  );
}
