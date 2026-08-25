import { Skeleton } from "@/components/ui/data-display/skeleton";

const CATEGORY_ROW_COUNT = 6;

/** Mirrors CategorySales: header + name / progress / share rows. */
export function CategorySalesSkeleton() {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <ul className="mt-6 flex flex-col gap-4">
        {Array.from({ length: CATEGORY_ROW_COUNT }, (_, index) => (
          <li key={index} className="grid items-center gap-2 grid-cols-category-sales-row">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="ml-auto h-4 w-10" />
          </li>
        ))}
      </ul>
    </div>
  );
}
