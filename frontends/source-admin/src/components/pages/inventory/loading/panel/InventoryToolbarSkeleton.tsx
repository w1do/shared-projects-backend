import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Mirrors InventoryPanel toolbar: search input + status/brand selects. */
export function InventoryToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full max-w-sm">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>
    </div>
  );
}
