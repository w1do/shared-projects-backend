"use client";

import { Inbox, Package } from "lucide-react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Badge } from "@/components/ui/data-display/badge";
import { ScrollArea } from "@/components/ui/layout/scroll-area";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import { Select } from "@/components/ui/inputs/select";
import type { SupportTicket, TicketStatus } from "@/lib/admin/mocks/support";
import {
  STATUS_OPTIONS,
  channelIcon,
  statusBadgeColor,
} from "@/components/pages/support/config/filters";
import { MessageBubble } from "../message-bubble";
import { TicketComposer } from "../ticket-composer";

interface TicketThreadProps {
  ticket: SupportTicket | null;
  onSend: (body: string) => void;
  onStatusChange: (status: TicketStatus) => void;
}

const statusChoices = STATUS_OPTIONS.filter((o) => o.value !== "all");

export function TicketThread({ ticket, onSend, onStatusChange }: TicketThreadProps) {
  if (!ticket) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-12 text-center text-foreground">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <Inbox className="size-6 text-primary" />
        </div>
        <div>
          <p className="font-openrunde text-heading-sm text-foreground">No ticket selected</p>
          <p className="mt-2 text-caption text-muted-foreground">
            Choose a conversation from the inbox to start replying.
          </p>
        </div>
      </div>
    );
  }

  const gradientId = `thread-${ticket.id}`;
  const ChannelIcon = channelIcon[ticket.channel];

  return (
    <div className="flex flex-1 flex-col">
      <AdminDynamicStyles
        gradients={[
          { id: gradientId, start: ticket.customer.gradient[0], end: ticket.customer.gradient[1] },
        ]}
      />

      <div className="flex flex-col gap-4 border-b border-border/60 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar
              className="size-10 shrink-0 border border-border/80"
              fallbackClassName="font-semibold text-caption text-primary-foreground admin-gradient-swatch"
              data-admin-gradient={gradientId}
            >
              {ticket.customer.initials}
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold text-foreground">
                {ticket.customer.name}
              </span>
              <span className="truncate text-caption text-muted-foreground-lighter">
                {ticket.customer.email}
              </span>
            </div>
          </div>
          <Select
            value={ticket.status}
            onChange={(e) => onStatusChange(e.target.value as TicketStatus)}
            options={statusChoices}
            className="w-40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-openrunde text-subheading text-foreground">{ticket.subject}</span>
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={statusBadgeColor(ticket.status)} shape="circle">
              {ticket.status}
            </Badge>
            <Badge color="muted" shape="circle" startIcon={<ChannelIcon />}>
              {ticket.channel}
            </Badge>
            {ticket.orderId && (
              <Badge color="muted" shape="circle" startIcon={<Package />}>
                {ticket.orderId}
              </Badge>
            )}
            <span className="text-caption text-muted-foreground-lighter">
              Assigned to {ticket.assignee}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-6 p-6">
          {ticket.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              customer={ticket.customer}
              customerGradientId={gradientId}
            />
          ))}
        </div>
      </ScrollArea>

      <TicketComposer onSend={onSend} />
    </div>
  );
}
