import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Mirrors DashboardHeader: greeting block + range/export controls. */
export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-16 w-80 max-w-full" />
        <div className="flex max-w-xl flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 w-40 rounded-full" />
        <Skeleton className="h-10 w-28 rounded-full" />
      </div>
    </div>
  );
}
