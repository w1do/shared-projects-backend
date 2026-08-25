/**
 * Versioned localStorage store for support tickets (mock backend).
 */
import type { SupportTicket, TicketStatus } from "@/lib/admin/mocks/support";
import { mockSupportTickets } from "@/lib/admin/mocks/support";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const seed: SupportTicket[] = [...mockSupportTickets];
const store = createVersionedLocalStore<SupportTicket>({
  storageKey: storageKey("support-tickets"),
  seedVersionKey: storageKey("support-tickets-seed-version"),
  seedVersion: "1",
  seed,
});

export function readStoredSupportTickets(): SupportTicket[] {
  return store.read();
}

export function saveStoredSupportTickets(items: SupportTicket[]) {
  store.save(items);
}

export function updateStoredTicketStatus(id: string, status: TicketStatus) {
  saveStoredSupportTickets(
    readStoredSupportTickets().map((ticket) =>
      ticket.id === id
        ? { ...ticket, status, updatedAt: new Date().toISOString(), unread: false }
        : ticket,
    ),
  );
}

export function addStoredTicketMessage(id: string, body: string) {
  const now = new Date().toISOString();
  saveStoredSupportTickets(
    readStoredSupportTickets().map((ticket) => {
      if (ticket.id !== id) return ticket;
      return {
        ...ticket,
        updatedAt: now,
        unread: false,
        messages: [
          ...ticket.messages,
          {
            id: `msg-${Date.now()}`,
            author: "agent" as const,
            authorName: "You",
            body,
            sentAt: now,
          },
        ],
      };
    }),
  );
}

export function markStoredTicketRead(id: string) {
  saveStoredSupportTickets(
    readStoredSupportTickets().map((ticket) =>
      ticket.id === id ? { ...ticket, unread: false } : ticket,
    ),
  );
}
