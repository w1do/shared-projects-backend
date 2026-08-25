import { Skeleton } from "@/components/ui/data-display/skeleton";

const MESSAGE_COUNT = 4;

/** Alternating customer / agent message placeholders. */
function MessageSkeleton({ alignEnd }: { alignEnd: boolean }) {
  return (
    <div className={`flex gap-2 ${alignEnd ? "flex-row-reverse" : "flex-row"}`}>
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className={`flex min-w-0 flex-col gap-2 ${alignEnd ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className={`h-16 max-w-lg rounded-2xl ${alignEnd ? "w-64" : "w-72"}`} />
      </div>
    </div>
  );
}

/**
 * Mirrors TicketThread: customer header, subject + badges, message stack, composer.
 */
export function TicketThreadSkeleton() {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex flex-col gap-4 border-b border-border/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-col gap-2">
              <Skeleton className="h-4 w-32 max-w-full" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-40 shrink-0 rounded-full" />
        </div>

        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-64 max-w-full" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex flex-col gap-6 p-6">
          {Array.from({ length: MESSAGE_COUNT }, (_, index) => (
            <MessageSkeleton key={index} alignEnd={index % 2 === 1} />
          ))}
        </div>
      </div>

      <div className="flex items-end gap-4 border-t border-border/60 p-4">
        <Skeleton className="h-10 min-h-10 w-full rounded-2xl" />
        <Skeleton className="h-10 w-32 shrink-0 rounded-full" />
      </div>
    </div>
  );
}
