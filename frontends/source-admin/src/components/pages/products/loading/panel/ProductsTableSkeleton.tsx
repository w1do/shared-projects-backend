import { Skeleton } from "@/components/ui/data-display/skeleton";

const ROW_COUNT = 8;

/** Mirrors ProductsTable / DataGrid: checkbox, product, stock, created, status, price, actions. */
export function ProductsTableSkeleton() {
  return (
    <div className="min-w-0 overflow-x-auto rounded-3xl bg-background py-4 shadow-subtle-3 md:py-6">
      <div className="mb-0 flex items-center gap-4 border-b border-border/60 px-4 pb-4 md:px-6">
        <Skeleton className="size-4 shrink-0 rounded-sm" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="hidden h-4 w-20 xl:block" />
        <Skeleton className="hidden h-4 w-16 sm:block" />
        <Skeleton className="ml-auto h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>

      <ul className="flex flex-col">
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <li
            key={index}
            className="flex items-center gap-4 border-b border-border/40 px-4 py-4 last:border-b-0 md:px-6"
          >
            <Skeleton className="size-4 shrink-0 rounded-sm" />
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Skeleton className="size-12 shrink-0 rounded-xl" />
              <div className="min-w-0 flex flex-col gap-2">
                <Skeleton className="h-4 w-40 max-w-full" />
                <Skeleton className="h-4 w-48 max-w-full" />
              </div>
            </div>
            <div className="hidden shrink-0 flex-col gap-2 sm:flex">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="hidden h-4 w-20 shrink-0 xl:block" />
            <Skeleton className="hidden h-6 w-16 shrink-0 rounded-full sm:block" />
            <Skeleton className="h-4 w-16 shrink-0" />
            <Skeleton className="size-8 shrink-0 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
