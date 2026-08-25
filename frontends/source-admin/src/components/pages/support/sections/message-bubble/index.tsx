"use client";

import { Avatar } from "@/components/ui/data-display/avatar";
import type { SupportTicket, TicketMessage } from "@/lib/admin/mocks/support";
import { clockTime } from "@/components/pages/support/utils";

interface MessageBubbleProps {
  message: TicketMessage;
  customer: SupportTicket["customer"];
  customerGradientId: string;
}

export function MessageBubble({ message, customer, customerGradientId }: MessageBubbleProps) {
  const isAgent = message.author === "agent";

  return (
    <div className={`flex gap-2 text-foreground ${isAgent ? "flex-row-reverse" : "flex-row"}`}>
      {isAgent ? (
        <Avatar
          className="size-8 shrink-0 border border-border/80"
          fallbackClassName="bg-primary text-primary-foreground font-semibold text-caption"
        >
          {message.authorName.slice(0, 1)}
        </Avatar>
      ) : (
        <Avatar
          className="size-8 shrink-0 border border-border/80"
          fallbackClassName="font-semibold text-caption text-primary-foreground admin-gradient-swatch"
          data-admin-gradient={customerGradientId}
        >
          {customer.initials}
        </Avatar>
      )}

      <div className={`flex flex-col gap-2 ${isAgent ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2">
          <span className="text-caption font-semibold text-foreground">{message.authorName}</span>
          <span className="text-caption text-muted-foreground-lighter">
            {clockTime(message.sentAt)}
          </span>
        </div>
        <div
          className={`max-w-lg rounded-2xl px-4 py-2 text-caption leading-relaxed ${
            isAgent ? "bg-primary text-primary-foreground" : "bg-muted/60 text-foreground"
          }`}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}
