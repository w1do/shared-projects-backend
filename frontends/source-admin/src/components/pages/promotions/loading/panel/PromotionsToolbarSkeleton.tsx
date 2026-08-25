import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Mirrors PromotionsPanel toolbar: search, type/status selects, table/grid toggle. */
export function PromotionsToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="w-full max-w-sm">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}
