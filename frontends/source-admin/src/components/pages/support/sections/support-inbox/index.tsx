"use client";

import type { SupportTicket, TicketStatus } from "@/lib/admin/mocks/support";
import type { StatusFilter } from "@/components/pages/support/config/filters";
import { TicketList } from "../ticket-list";
import { TicketThread } from "../ticket-thread";

interface SupportInboxProps {
  tickets: SupportTicket[];
  selectedTicket: SupportTicket | null;
  searchTerm: string;
  statusFilter: StatusFilter;
  onSearch: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSelect: (ticket: SupportTicket) => void;
  onSend: (body: string) => void;
  onStatusChange: (status: TicketStatus) => void;
}

export function SupportInbox({
  tickets,
  selectedTicket,
  searchTerm,
  statusFilter,
  onSearch,
  onStatusFilterChange,
  onSelect,
  onSend,
  onStatusChange,
}: SupportInboxProps) {
  return (
    <div className="h-160 flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3 lg:flex-row text-foreground">
      <TicketList
        tickets={tickets}
        selectedId={selectedTicket?.id ?? null}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearch={onSearch}
        onStatusChange={onStatusFilterChange}
        onSelect={onSelect}
      />
      <TicketThread ticket={selectedTicket} onSend={onSend} onStatusChange={onStatusChange} />
    </div>
  );
}
