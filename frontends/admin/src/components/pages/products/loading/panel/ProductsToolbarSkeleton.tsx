import { Skeleton } from "@/components/ui/data-display/skeleton";

const FILTER_PILL_COUNT = 4;

/** Mirrors ProductsToolbar: search input + status filter pills + view toggle. */
export function ProductsToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="w-full lg:max-w-sm">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: FILTER_PILL_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}
