import { Skeleton } from "@/components/ui/data-display/skeleton";

const STAT_COUNT = 4;

/** Mirrors InventoryStats: 4-cell card grid with label, value, subtitle, icon tile. */
export function InventoryStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: STAT_COUNT }, (_, index) => (
        <div
          key={index}
          className="flex items-start justify-between border-b border-r border-border/60 p-6 last:border-r-0 sm:odd:border-r lg:border-b-0"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-4 w-36 max-w-full" />
          </div>
          <Skeleton className="size-16 shrink-0 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
