import { Skeleton } from "@/components/ui/data-display/skeleton";

const ROW_COUNT = 8;

/**
 * Mirrors CategoriesPanel DataGrid (default viewMode is table, 8 per page):
 * checkbox, name+icon, slug, status, product count, revenue, growth, actions.
 */
export function CategoriesTableSkeleton() {
  return (
    <div className="min-w-0 overflow-x-auto rounded-3xl bg-background py-4 shadow-subtle-3 md:py-6">
      <div className="mb-0 flex items-center gap-4 border-b border-border/60 px-4 pb-4 md:px-6">
        <Skeleton className="size-4 shrink-0 rounded-sm" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="hidden h-4 w-20 sm:block" />
        <Skeleton className="hidden h-4 w-16 md:block" />
        <Skeleton className="hidden h-4 w-24 lg:block" />
        <Skeleton className="hidden h-4 w-20 xl:block" />
        <Skeleton className="hidden h-4 w-20 xl:block" />
        <Skeleton className="ml-auto h-4 w-12" />
      </div>

      <ul className="flex flex-col">
        {Array.from({ length: ROW_COUNT }, (_, index) => (
          <li
            key={index}
            className="flex items-center gap-4 border-b border-border/40 px-4 py-4 last:border-b-0 md:px-6"
          >
            <Skeleton className="size-4 shrink-0 rounded-sm" />
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <Skeleton className="size-8 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-36 max-w-full" />
            </div>
            <Skeleton className="hidden h-4 w-24 shrink-0 sm:block" />
            <Skeleton className="hidden h-6 w-16 shrink-0 rounded-full md:block" />
            <Skeleton className="hidden h-4 w-20 shrink-0 lg:block" />
            <Skeleton className="hidden h-4 w-20 shrink-0 xl:block" />
            <Skeleton className="hidden h-4 w-16 shrink-0 xl:block" />
            <Skeleton className="size-8 shrink-0 rounded-full" />
          </li>
        ))}
      </ul>
    </div>
  );
}
