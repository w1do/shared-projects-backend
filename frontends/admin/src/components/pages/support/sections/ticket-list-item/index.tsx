"use client";

import { Avatar } from "@/components/ui/data-display/avatar";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { SupportTicket, TicketPriority } from "@/lib/admin/mocks/support";
import { lastMessagePreview, relativeTime } from "@/components/pages/support/utils";
import { Button } from "@/components/ui/inputs/button";
import { StatusDot } from "@/components/ui/feedback/status-dot";
import { cn } from "@/lib/utils";

interface TicketListItemProps {
  ticket: SupportTicket;
  isSelected: boolean;
  onSelect: (ticket: SupportTicket) => void;
}

function priorityStatusColor(
  priority: TicketPriority,
): "error" | "warning" | "primary" | "neutral" {
  switch (priority) {
    case "Urgent":
      return "error";
    case "High":
      return "warning";
    case "Normal":
      return "primary";
    case "Low":
    default:
      return "neutral";
  }
}

export function TicketListItem({ ticket, isSelected, onSelect }: TicketListItemProps) {
  const gradientId = `ticket-${ticket.id}`;

  return (
    <Button
      type="button"
      variant="ghost"
      color="primary"
      size="auto"
      fullWidth
      shape="rectangle"
      onClick={() => onSelect(ticket)}
      className={cn(
        "items-start justify-start gap-2 whitespace-normal border-l-2 px-4 py-4 text-left font-normal active:scale-100",
        isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted/40",
      )}
    >
      <AdminDynamicStyles
        gradients={[
          { id: gradientId, start: ticket.customer.gradient[0], end: ticket.customer.gradient[1] },
        ]}
      />
      <Avatar data-admin-gradient={gradientId}>{ticket.customer.initials}</Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-semibold text-foreground">
            {ticket.customer.name}
          </span>
          <span className="shrink-0 text-caption text-muted-foreground-lighter">
            {relativeTime(ticket.updatedAt)}
          </span>
        </div>
        <span className="truncate text-caption font-medium text-muted-foreground">
          {ticket.subject}
        </span>
        <span className="truncate text-caption text-muted-foreground-lighter">
          {lastMessagePreview(ticket)}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        <StatusDot color={priorityStatusColor(ticket.priority)} size="md" />
        {ticket.unread && <StatusDot color="primary" size="md" />}
      </div>
    </Button>
  );
}
