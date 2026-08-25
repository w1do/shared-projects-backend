"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SupportTicket, TicketStatus } from "@/lib/admin/mocks/support";
import { filterTickets } from "@/components/pages/support/utils";
import type { StatusFilter } from "@/components/pages/support/config/filters";
import { useSupportTicketsQuery } from "./use-support-query";
import {
  useAddTicketMessageMutation,
  useMarkTicketReadMutation,
  useUpdateTicketStatusMutation,
} from "./use-support-mutations";

type Options = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the catalog/dashboard pattern.
   */
  initialTickets?: SupportTicket[];
};

/** Support inbox page: Query list + status/message mutations. */
export function useSupportPage(options: Options = {}) {
  const { initialTickets } = options;
  const hasSeed = initialTickets !== undefined;

  const { data, isPending } = useSupportTicketsQuery({
    initialData: hasSeed ? initialTickets : undefined,
  });
  const tickets = useMemo(() => data ?? initialTickets ?? [], [data, initialTickets]);

  const statusMutation = useUpdateTicketStatusMutation();
  const messageMutation = useAddTicketMessageMutation();
  const markReadMutation = useMarkTicketReadMutation();

  const [selectedId, setSelectedId] = useState<string | null>(initialTickets?.[0]?.id ?? null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const deepLinkHandledRef = useRef(false);

  // Deep-link + default selection once tickets are available (no SSR seed).
  useEffect(() => {
    if (tickets.length === 0) return;

    if (!deepLinkHandledRef.current && typeof window !== "undefined") {
      deepLinkHandledRef.current = true;
      const ticketId = new URLSearchParams(window.location.search).get("ticket");
      if (ticketId && tickets.some((ticket) => ticket.id === ticketId)) {
        setSelectedId(ticketId);
        markReadMutation.mutate(ticketId);
        return;
      }
    }

    if (selectedId === null) {
      setSelectedId(tickets[0]?.id ?? null);
      return;
    }

    if (!tickets.some((ticket) => ticket.id === selectedId)) {
      setSelectedId(tickets[0]?.id ?? null);
    }
    // markReadMutation is stable enough for one-shot deep link; omit from deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, selectedId]);

  const filtered = useMemo(
    () => filterTickets(tickets, searchTerm, statusFilter),
    [tickets, searchTerm, statusFilter],
  );

  const selectedTicket = useMemo(
    () => tickets.find((t) => t.id === selectedId) ?? null,
    [tickets, selectedId],
  );

  const selectTicket = (id: string) => {
    setSelectedId(id);
    markReadMutation.mutate(id);
  };

  const updateStatus = (id: string, status: TicketStatus) => {
    statusMutation.mutate({ id, status });
  };

  const sendMessage = (id: string, body: string) => {
    messageMutation.mutate({ id, body });
  };

  return {
    tickets,
    filtered,
    selectedId,
    selectedTicket,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectTicket,
    updateStatus,
    sendMessage,
    /** No cached data yet — show full-page SupportLoadingState. */
    isPending: hasSeed ? false : isPending,
  };
}
