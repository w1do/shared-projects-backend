import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Default OrdersPanel page size (useDataTable itemsPerPage). */
const ROW_COUNT = 8;

/**
 * Mirrors OrdersTable / DataGrid columns: order id, customer, items,
 * placed at, status, method, total, actions. Page size default is 8.
 */
export function OrdersTableSkeleton() {
  return (
    <div className="min-w-0 overflow-x-auto rounded-3xl bg-background py-4 shadow-subtle-3 md:py-6">
      <div className="mb-0 flex items-center gap-4 border-b border-border/60 px-4 pb-4 md:px-6">
        <Skeleton className="h-4 w-16 shrink-0" />
        <Skeleton className="h-4 w-20 shrink-0" />
        <Skeleton className="hidden h-4 w-28 sm:block" />
        <Skeleton className="hidden h-4 w-20 md:block" />
        <Skeleton className="hidden h-4 w-24 lg:block" />
        <Skeleton className="hidden h-4 w-16 xl:block" />
        <Skeleton className="ml-auto h-4 w-16 shrink-0" />
        <Skeleton className="h-4 w-12 shrink-0" />
      </div>

      <ul className="flex flex-col">
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <li
            key={index}
            className="flex items-center gap-4 border-b border-border/40 px-4 py-4 last:border-b-0 md:px-6"
          >
            <Skeleton className="h-4 w-20 shrink-0" />
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <div className="flex min-w-0 flex-col gap-2">
                <Skeleton className="h-4 w-32 max-w-full" />
                <Skeleton className="h-4 w-40 max-w-full" />
              </div>
            </div>
            <div className="hidden shrink-0 items-center gap-4 sm:flex">
              <div className="flex items-center">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="-ml-2 size-8 rounded-full" />
                <Skeleton className="-ml-2 size-8 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="hidden h-4 w-20 shrink-0 md:block" />
            <Skeleton className="hidden h-6 w-20 shrink-0 rounded-full lg:block" />
            <Skeleton className="hidden h-4 w-16 shrink-0 xl:block" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="size-8 shrink-0 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
