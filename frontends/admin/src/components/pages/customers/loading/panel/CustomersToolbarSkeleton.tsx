import { Skeleton } from "@/components/ui/data-display/skeleton";

const FILTER_SELECT_COUNT = 3;

/**
 * Mirrors CustomersPanel toolbar: search input + 3 selects (tier, skin type, concern).
 */
export function CustomersToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="w-full max-w-sm">
        <Skeleton className="h-10 w-full rounded-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {Array.from({ length: FILTER_SELECT_COUNT }, (_, index) => (
          <Skeleton key={index} className="h-10 w-40 rounded-full" />
        ))}
      </div>
    </div>
  );
}
