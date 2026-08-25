"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProductFull } from "@/lib/admin/mocks/types";
import { listProducts } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type UseProductsQueryOptions = {
  /** SSR seed so first paint stays populated before client rehydrate. */
  initialData?: ProductFull[];
  enabled?: boolean;
};

export function useProductsQuery(options: UseProductsQueryOptions = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.products.list(),
    queryFn: listProducts,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
