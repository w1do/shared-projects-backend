import { Skeleton } from "@/components/ui/data-display/skeleton";

const ROW_COUNT = 8;

/**
 * Mirrors PromotionsPanel table view (default):
 * code, type, reward, usage, schedule, revenue, status, actions.
 * Page size default is 8.
 */
export function PromotionsTableSkeleton() {
  return (
    <div className="min-w-0 overflow-x-auto rounded-3xl bg-background py-4 shadow-subtle-3 md:py-6">
      <div className="mb-0 flex items-center gap-4 border-b border-border/60 px-4 pb-4 md:px-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="hidden h-4 w-16 sm:block" />
        <Skeleton className="hidden h-4 w-20 md:block" />
        <Skeleton className="hidden h-4 w-16 lg:block" />
        <Skeleton className="hidden h-4 w-20 xl:block" />
        <Skeleton className="hidden h-4 w-20 xl:block" />
        <Skeleton className="ml-auto h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>

      <ul className="flex flex-col">
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <li
            key={index}
            className="flex items-center gap-4 border-b border-border/40 px-4 py-4 last:border-b-0 md:px-6"
          >
            <div className="min-w-0 flex flex-1 flex-col gap-2">
              <Skeleton className="h-8 w-28 rounded-lg" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
            <Skeleton className="hidden h-6 w-24 shrink-0 rounded-full sm:block" />
            <div className="hidden shrink-0 flex-col gap-2 md:flex">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="hidden w-32 shrink-0 flex-col gap-2 lg:flex">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="hidden shrink-0 flex-col gap-2 xl:flex">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="hidden h-4 w-16 shrink-0 xl:block" />
            <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
            <Skeleton className="size-8 shrink-0 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
