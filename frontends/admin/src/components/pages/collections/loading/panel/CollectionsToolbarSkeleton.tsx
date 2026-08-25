import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Mirrors CollectionsPanel toolbar: search, status select, grid/table toggle. */
export function CollectionsToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full max-w-sm">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}
