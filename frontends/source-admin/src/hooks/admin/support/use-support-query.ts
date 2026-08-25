"use client";

import { useQuery } from "@tanstack/react-query";
import type { SupportTicket } from "@/lib/admin/mocks/support";
import { listSupportTickets } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = { initialData?: SupportTicket[]; enabled?: boolean };

export function useSupportTicketsQuery(options: Options = {}) {
  const { initialData, enabled = true } = options;
  return useQuery({
    queryKey: adminQueryKeys.support.list(),
    queryFn: listSupportTickets,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
