import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Mirrors DataTableFooter: page-size control, range label, pagination. */
export function BlogsFooterSkeleton() {
  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 sm:flex-row">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-8 w-16 rounded-lg" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
        <Skeleton className="size-8 rounded-full" />
      </div>
    </div>
  );
}
