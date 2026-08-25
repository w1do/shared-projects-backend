"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProductFull } from "@/lib/admin/mocks/types";
import { getProductById } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type UseProductQueryOptions = {
  /** SSR seed (seed catalog / API). Omitted for localStorage-only products. */
  initialData?: ProductFull | null;
  enabled?: boolean;
};

/**
 * Product detail query. On the client, queryFn reads localStorage-backed catalog in mock mode,
 * so products created after SSR still resolve. SSR seed is treated as immediately stale so the
 * client revalidates against the latest store/API.
 */
export function useProductQuery(id: string, options: UseProductQueryOptions = {}) {
  const { initialData, enabled = true } = options;
  const seed = initialData ?? undefined;

  return useQuery({
    queryKey: adminQueryKeys.products.detail(id),
    queryFn: () => getProductById(id),
    initialData: seed,
    // Force a client revalidate so mock-mode localStorage wins over SSR seed.
    initialDataUpdatedAt: seed ? 0 : undefined,
    enabled: Boolean(id) && enabled,
  });
}
