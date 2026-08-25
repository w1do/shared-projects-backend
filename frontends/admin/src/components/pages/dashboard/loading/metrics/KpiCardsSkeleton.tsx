import { Skeleton } from "@/components/ui/data-display/skeleton";

const KPI_COUNT = 4;

/** Mirrors KpiCards grid and KpiCard layout (label, delta, value, sparkline). */
export function KpiCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: KPI_COUNT }, (_, index) => {
        const accent = index === 0;
        return (
          <div
            key={index}
            className={
              "relative flex flex-col justify-between rounded-3xl p-6 " +
              (accent ? "bg-accent" : "bg-card shadow-subtle-3")
            }
          >
            <div className="flex items-start justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-12 w-24" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
