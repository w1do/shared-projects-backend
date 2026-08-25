import { Skeleton } from "@/components/ui/data-display/skeleton";

const BEST_SELLER_ROW_COUNT = 3;

/** Mirrors BestSellers: header + product revenue rows. */
export function BestSellersSkeleton() {
  return (
    <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>

      <ul className="mt-6 space-y-4">
        {Array.from({ length: BEST_SELLER_ROW_COUNT }, (_, index) => (
          <li
            key={index}
            className="grid items-center gap-4 rounded-2xl border border-border/70 p-2 grid-cols-widget-product-row"
          >
            <Skeleton className="size-14 shrink-0 rounded-lg" />
            <div className="min-w-0 flex flex-col gap-2">
              <Skeleton className="h-4 w-44 max-w-full" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
