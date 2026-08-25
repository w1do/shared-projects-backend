"use client";

import { useQuery } from "@tanstack/react-query";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { listOrders } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = {
  /** Optional seed (tests/SSR). Prefer omitting so isPending drives the skeleton. */
  initialData?: DetailedOrder[];
  enabled?: boolean;
};

export function useOrdersQuery(options: Options = {}) {
  const { initialData, enabled = true } = options;
  return useQuery({
    queryKey: adminQueryKeys.orders.list(),
    queryFn: listOrders,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
