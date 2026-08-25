import { Skeleton } from "@/components/ui/data-display/skeleton";

const ACTION_PILL_COUNT = 6;

/** Mirrors QuickActions bar (desktop): label chip + action pills. */
export function QuickActionsSkeleton() {
  return (
    <div className="hidden md:flex items-center rounded-3xl border border-border bg-muted px-4 py-2 gap-4">
      <div className="flex flex-1 min-w-0 flex-wrap items-center gap-4">
        <div className="flex shrink-0 items-center gap-2 border-r border-border pr-4">
          <Skeleton className="size-2 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: ACTION_PILL_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-8 w-32 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
