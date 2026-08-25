import { Skeleton } from "@/components/ui/data-display/skeleton";

const ROW_COUNT = 6;

/** Mirrors VariantMatrixTable form-section: header, product rows, pagination. */
export function MatrixTableSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border/40 bg-background p-6 shadow-subtle">
      <div className="flex flex-col gap-4 border-b border-border/40 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>

      <div className="min-w-0 overflow-x-auto">
        <div className="mb-0 flex items-center gap-4 border-b border-border/60 pb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="hidden h-4 w-16 sm:block" />
          <Skeleton className="hidden h-4 w-16 md:block" />
          <Skeleton className="ml-auto h-4 w-12" />
        </div>

        <ul className="flex flex-col">
          {Array.from({ length: ROW_COUNT }, (_, index) => (
            <li
              key={index}
              className="flex items-center gap-4 border-b border-border/40 py-4 last:border-b-0"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <Skeleton className="h-4 w-32 max-w-full" />
              </div>
              <Skeleton className="hidden h-4 w-40 shrink-0 sm:block" />
              <Skeleton className="hidden h-4 w-16 shrink-0 md:block" />
              <Skeleton className="hidden h-4 w-12 shrink-0 lg:block" />
              <div className="flex shrink-0 items-center gap-2">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="size-8 rounded-full" />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 border-t border-border/40 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="size-8 rounded-full" />
        </div>
      </div>
    </div>
  );
}
