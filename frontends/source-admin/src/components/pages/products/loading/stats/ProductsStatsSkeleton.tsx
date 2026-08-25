import { Skeleton } from "@/components/ui/data-display/skeleton";

const STAT_COUNT = 4;

/** Mirrors ProductsStats: 4-cell bordered card grid with label, value, icon tile. */
export function ProductsStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 lg:grid-cols-4">
      {Array.from({ length: STAT_COUNT }, (_, index) => (
        <div
          key={index}
          className="flex items-start justify-between border-b border-r border-border/60 p-6"
        >
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
          <Skeleton className="size-16 shrink-0 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
