import { Skeleton } from "@/components/ui/data-display/skeleton";

/**
 * Mirrors ProductFormHeader / PageHeader used by Add + Edit product forms:
 * breadcrumb trail, title, and action pills (optional Auto-fill + submit).
 */
export function ProductFormHeaderSkeleton({ showAutoFill = false }: { showAutoFill?: boolean }) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0 flex flex-col">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="mt-4 h-16 w-64 max-w-full" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {showAutoFill ? <Skeleton className="h-8 w-28 rounded-full" /> : null}
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>
    </div>
  );
}
