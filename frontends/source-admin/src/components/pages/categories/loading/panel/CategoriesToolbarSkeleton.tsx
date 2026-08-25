import { Skeleton } from "@/components/ui/data-display/skeleton";

/** Mirrors CategoriesToolbar: search input + status select + view toggle. */
export function CategoriesToolbarSkeleton() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Skeleton className="h-10 w-full max-w-sm rounded-full" />
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-10 w-36 rounded-lg" />
        <Skeleton className="h-10 w-20 rounded-full" />
      </div>
    </div>
  );
}
