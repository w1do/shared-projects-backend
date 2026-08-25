"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, ArrowRight } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/overlay/popover";
import { type SupportTicket, type TicketPriority } from "@/lib/admin/mocks/support";
import { useSupportTicketsQuery } from "@/hooks/admin/support";
import { useMarkTicketReadMutation } from "@/hooks/admin/support";
import { relativeTime, lastMessagePreview } from "@/components/pages/support/utils";
import { StatusDot } from "@/components/ui/feedback/status-dot";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import { Avatar } from "@/components/ui/data-display/avatar";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import { cn } from "@/lib/utils";

const RECENT_COUNT = 5;

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

function CompactTicketRow({
  ticket,
  onSelect,
}: {
  ticket: SupportTicket;
  onSelect: (id: string) => void;
}) {
  const gradientId = `ticket-menu-${ticket.id}`;

  return (
    <Button
      type="button"
      variant="ghost"
      color="primary"
      size="auto"
      fullWidth
      onClick={() => onSelect(ticket.id)}
      className={cn(
        "relative items-start justify-start gap-2 whitespace-normal text-left font-normal active:scale-100",
        ticket.unread && "bg-primary/5",
      )}
    >
      <AdminDynamicStyles
        gradients={[
          { id: gradientId, start: ticket.customer.gradient[0], end: ticket.customer.gradient[1] },
        ]}
      />
      <Avatar size="sm" data-admin-gradient={gradientId}>
        {ticket.customer.initials}
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-caption font-semibold text-foreground">
              {ticket.customer.name}
            </span>
            <StatusDot color={priorityStatusColor(ticket.priority)} size="md" />
          </div>
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
      {ticket.unread && <StatusDot color="primary" size="md" className="mt-2" />}
    </Button>
  );
}

export function SupportQuickMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: tickets = [] } = useSupportTicketsQuery();
  const markReadMutation = useMarkTicketReadMutation();

  const unreadCount = tickets.filter((t) => t.unread).length;
  const recent = [...tickets]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, RECENT_COUNT);

  const handleSelectTicket = (id: string) => {
    setOpen(false);
    setTimeout(() => {
      markReadMutation.mutate(id);
      router.push(`/admin/support?ticket=${id}`);
    }, 200);
  };

  const handleMarkAllRead = () => {
    tickets.filter((t) => t.unread).forEach((t) => markReadMutation.mutate(t.id));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <IconButton variant="ghost" shape="circle" className="relative" aria-label="Support">
          <HelpCircle />
          {unreadCount > 0 && <StatusDot color="error" ping className="absolute right-2 top-2" />}
        </IconButton>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border/60 p-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Support Tickets</span>
            {unreadCount > 0 && (
              <Badge variant="contained" color="primary" shape="circle" size="sm">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="text" color="primary" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>

        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto p-2">
          {recent.length === 0 ? (
            <div className="p-4 text-center text-caption text-muted-foreground-lighter">
              No tickets found.
            </div>
          ) : (
            recent.map((ticket) => (
              <CompactTicketRow key={ticket.id} ticket={ticket} onSelect={handleSelectTicket} />
            ))
          )}
        </div>

        <Button
          component="Link"
          href="/admin/support"
          variant="ghost"
          shape="rectangle"
          className="h-auto w-full gap-2 border-t p-4 active:scale-100"
          endIcon={<ArrowRight className="size-4" />}
          onClick={() => setOpen(false)}
        >
          View support inbox
        </Button>
      </PopoverContent>
    </Popover>
  );
}
