import { Skeleton } from "@/components/ui/data-display/skeleton";

const PRODUCT_ROW_COUNT = 4;

/** Mirrors VariantsProductSelector: search header + compact product rows. */
export function ProductSelectorSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-subtle-3">
      <div className="flex flex-col gap-2 border-b border-border/40 bg-muted/20 px-4 pt-4 pb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>

      <ul className="flex max-h-64 flex-1 flex-col gap-2 overflow-y-auto p-2 pt-4">
        {Array.from({ length: PRODUCT_ROW_COUNT }, (_, index) => (
          <li
            key={index}
            className="flex items-center gap-4 rounded-2xl border border-border/30 px-4 py-4"
          >
            <Skeleton className="size-12 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 flex flex-col gap-2">
              <Skeleton className="h-4 w-32 max-w-full" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
