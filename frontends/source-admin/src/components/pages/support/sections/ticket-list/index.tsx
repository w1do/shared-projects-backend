"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { Badge } from "@/components/ui/data-display/badge";
import type { SupportTicket } from "@/lib/admin/mocks/support";
import { STATUS_OPTIONS, type StatusFilter } from "@/components/pages/support/config/filters";
import { TicketListItem } from "../ticket-list-item";

interface TicketListProps {
  tickets: SupportTicket[];
  selectedId: string | null;
  searchTerm: string;
  statusFilter: StatusFilter;
  onSearch: (value: string) => void;
  onStatusChange: (value: StatusFilter) => void;
  onSelect: (ticket: SupportTicket) => void;
}

export function TicketList({
  tickets,
  selectedId,
  searchTerm,
  statusFilter,
  onSearch,
  onStatusChange,
  onSelect,
}: TicketListProps) {
  return (
    <div className="w-full lg:w-90 flex flex-col border-b border-border/60 lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-4 border-b border-border/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Inbox
          </span>
          <Badge variant="soft" color="neutral" shape="circle">
            {tickets.length}
          </Badge>
        </div>
        <Input
          placeholder="Search tickets..."
          startIcon={<Search />}
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
          options={STATUS_OPTIONS}
          placeholder="All Tickets"
          className="w-full"
        />
      </div>

      <div className="min-w-0 flex-1 overflow-y-auto">
        {tickets.length === 0 ? (
          <p className="p-6 text-center text-caption text-muted-foreground-lighter">
            No tickets found.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-border/50">
            {tickets.map((ticket) => (
              <TicketListItem
                key={ticket.id}
                ticket={ticket}
                isSelected={ticket.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
