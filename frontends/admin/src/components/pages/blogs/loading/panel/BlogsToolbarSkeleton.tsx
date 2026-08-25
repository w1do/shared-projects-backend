import { Skeleton } from "@/components/ui/data-display/skeleton";

/**
 * Mirrors BlogsPanel controls: search input + category select row.
 */
export function BlogsToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="w-full max-w-sm">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
      <Skeleton className="h-10 w-40 rounded-lg" />
    </div>
  );
}
