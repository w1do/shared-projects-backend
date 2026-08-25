import type { SupportTicket } from "@/lib/admin/mocks/support";
import type { StatusFilter } from "../config/filters";

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function clockTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function lastMessagePreview(ticket: SupportTicket): string {
  const last = ticket.messages[ticket.messages.length - 1];
  if (!last) return "";
  return last.author === "agent" ? `You: ${last.body}` : last.body;
}

export function filterTickets(
  tickets: SupportTicket[],
  searchTerm: string,
  statusFilter: StatusFilter,
): SupportTicket[] {
  const query = searchTerm.trim().toLowerCase();
  return tickets.filter((ticket) => {
    const matchesSearch =
      query === "" ||
      ticket.subject.toLowerCase().includes(query) ||
      ticket.customer.name.toLowerCase().includes(query) ||
      ticket.id.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
}
