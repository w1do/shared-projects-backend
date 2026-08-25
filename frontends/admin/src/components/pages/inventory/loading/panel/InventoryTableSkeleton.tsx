import { Skeleton } from "@/components/ui/data-display/skeleton";

const ROW_COUNT = 8;

/**
 * Mirrors Inventory DataGrid columns:
 * product, stock level, status, incoming, price, stock value, actions.
 */
export function InventoryTableSkeleton() {
  return (
    <div className="min-w-0 overflow-x-auto rounded-3xl bg-background py-4 shadow-subtle-3 md:py-6">
      <div className="mb-0 flex items-center gap-4 border-b border-border/60 px-4 pb-4 md:px-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="hidden h-4 w-24 sm:block" />
        <Skeleton className="hidden h-4 w-16 md:block" />
        <Skeleton className="hidden h-4 w-20 lg:block" />
        <Skeleton className="hidden h-4 w-12 xl:block" />
        <Skeleton className="ml-auto hidden h-4 w-20 xl:block" />
        <Skeleton className="h-4 w-12" />
      </div>

      <ul className="flex flex-col">
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <li
            key={index}
            className="flex items-center gap-4 border-b border-border/40 px-4 py-4 last:border-b-0 md:px-6"
          >
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Skeleton className="size-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex flex-col gap-2">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </div>
            <div className="hidden w-40 shrink-0 flex-col gap-2 sm:flex">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <Skeleton className="hidden h-6 w-20 shrink-0 rounded-full md:block" />
            <Skeleton className="hidden h-6 w-24 shrink-0 rounded-full lg:block" />
            <Skeleton className="hidden h-4 w-12 shrink-0 xl:block" />
            <Skeleton className="hidden h-4 w-16 shrink-0 xl:block" />
            <Skeleton className="size-8 shrink-0 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
