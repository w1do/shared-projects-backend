import { Skeleton } from "@/components/ui/data-display/skeleton";

const TICKET_ROW_COUNT = 6;

/** Single inbox row: avatar, name/time, subject, preview, priority dots. */
function TicketRowSkeleton() {
  return (
    <div className="flex items-start gap-2 border-l-2 border-transparent px-4 py-4">
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-4 w-28 max-w-full" />
          <Skeleton className="h-4 w-12 shrink-0" />
        </div>
        <Skeleton className="h-4 w-40 max-w-full" />
        <Skeleton className="h-4 w-48 max-w-full" />
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <Skeleton className="size-2 rounded-full" />
        <Skeleton className="size-2 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Mirrors TicketList: inbox label + count badge, search, status select, scrollable rows.
 */
export function TicketListSkeleton() {
  return (
    <div className="flex w-full flex-col border-b border-border/60 lg:w-90 lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-4 border-b border-border/60 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-8 rounded-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-full" />
        <Skeleton className="h-10 w-full rounded-full" />
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <div className="flex flex-col divide-y divide-border/50">
          {Array.from({ length: TICKET_ROW_COUNT }, (_, index) => (
            <TicketRowSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
