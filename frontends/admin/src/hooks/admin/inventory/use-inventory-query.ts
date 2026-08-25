"use client";

import { useQuery } from "@tanstack/react-query";
import type { InventoryItem } from "@/lib/admin/mocks/types";
import { listInventory } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type UseInventoryQueryOptions = {
  initialData?: InventoryItem[];
  enabled?: boolean;
};

export function useInventoryQuery(options: UseInventoryQueryOptions = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.inventory.list(),
    queryFn: listInventory,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
