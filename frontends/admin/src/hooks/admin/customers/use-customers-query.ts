"use client";

import { useQuery } from "@tanstack/react-query";
import type { DetailedCustomer } from "@/lib/admin/types/customers";
import { listCustomers } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = { initialData?: DetailedCustomer[]; enabled?: boolean };

export function useCustomersQuery(options: Options = {}) {
  const { initialData, enabled = true } = options;
  return useQuery({
    queryKey: adminQueryKeys.customers.list(),
    queryFn: listCustomers,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
