import { Skeleton } from "@/components/ui/data-display/skeleton";

const ORDER_ROW_COUNT = 5;

/** Mirrors RecentOrders DataGrid: customer, items, status, total. */
export function RecentOrdersSkeleton() {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="mb-6 flex items-end justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      <div className="min-w-0 overflow-x-auto">
        <div className="mb-4 flex items-center gap-4 border-b border-border/40 pb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="hidden h-4 w-24 md:block" />
          <Skeleton className="ml-auto h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>

        <ul className="flex flex-col">
          {Array.from({ length: ORDER_ROW_COUNT }, (_, index) => (
            <li
              key={index}
              className="flex items-center gap-4 border-b border-border/40 py-4 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="min-w-0 flex flex-col gap-2">
                  <Skeleton className="h-4 w-32 max-w-full" />
                  <Skeleton className="h-4 w-40 max-w-full" />
                </div>
              </div>
              <div className="hidden min-w-0 flex-col gap-2 md:flex">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-16 shrink-0" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
