import { Skeleton } from "@/components/ui/data-display/skeleton";

const DIMENSION_COUNT = 2;
const VALUE_PILL_COUNT = 3;

/** Mirrors VariantOptionsEditor form-section: title, dimension cards, create row. */
export function OptionsEditorSkeleton() {
  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-border/40 bg-background p-6 shadow-subtle">
      <div className="flex items-center justify-between border-b border-border/40 pb-4">
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {Array.from({ length: DIMENSION_COUNT }, (_, index) => (
          <div key={index} className="flex flex-col gap-4 rounded-2xl bg-card p-4 shadow-subtle">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="size-8 rounded-full" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: VALUE_PILL_COUNT }, (_, pillIndex) => (
                <Skeleton key={pillIndex} className="h-8 w-16 rounded-full" />
              ))}
              <Skeleton className="size-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-border/40 pt-2">
        <Skeleton className="h-4 w-36" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-full rounded-full" />
          <Skeleton className="h-10 w-20 shrink-0 rounded-full" />
        </div>
      </div>
    </div>
  );
}
