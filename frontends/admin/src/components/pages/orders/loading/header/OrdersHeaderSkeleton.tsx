import { Skeleton } from "@/components/ui/data-display/skeleton";

/**
 * Mirrors Orders PageHeader: 3-level breadcrumb (Admin · Commerce · Orders),
 * title, description. No header actions on the live page.
 */
export function OrdersHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 flex flex-col">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="mt-4 h-16 w-40 max-w-full" />
        <div className="mt-2 flex max-w-xl flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}
