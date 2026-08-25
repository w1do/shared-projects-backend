import { TicketListSkeleton } from "./TicketListSkeleton";
import { TicketThreadSkeleton } from "./TicketThreadSkeleton";

/**
 * Mirrors SupportInbox split layout: ticket list | conversation thread.
 * Fixed height shell matches the live inbox card.
 */
export function SupportInboxSkeleton() {
  return (
    <div className="flex h-160 flex-col overflow-hidden rounded-3xl border border-border/60 bg-card text-foreground shadow-subtle-3 lg:flex-row">
      <TicketListSkeleton />
      <TicketThreadSkeleton />
    </div>
  );
}
