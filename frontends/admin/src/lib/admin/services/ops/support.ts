import type { SupportTicket, TicketStatus } from "@/lib/admin/mocks/support";
import {
  addStoredTicketMessage,
  markStoredTicketRead,
  readStoredSupportTickets,
  updateStoredTicketStatus,
} from "@/lib/admin/support/store";
import { adminMutations, getAdminSupportTickets } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

/**
 * Canonical support ticket list loader for TanStack Query.
 * Mock latency comes from mockNetworkDelay so the inbox page can share skeleton UX.
 */
export async function listSupportTickets(): Promise<SupportTicket[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredSupportTickets();
  }
  return getAdminSupportTickets();
}

export async function updateTicketStatus(id: string, status: TicketStatus | string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.updateTicketStatus(id, status);
    return;
  }
  updateStoredTicketStatus(id, status as TicketStatus);
}

export async function addTicketMessage(id: string, body: string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.addTicketMessage(id, body);
    return;
  }
  addStoredTicketMessage(id, body);
}

export async function markTicketRead(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    // No dedicated API — local UX only when mock.
    return;
  }
  markStoredTicketRead(id);
}
