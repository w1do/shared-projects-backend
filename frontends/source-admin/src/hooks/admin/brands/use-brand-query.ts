"use client";

import { useQuery } from "@tanstack/react-query";
import type { Brand } from "@/lib/admin/mocks/types";
import { getBrandById } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = {
  initialData?: Brand | null;
  enabled?: boolean;
};

/** Brand detail Query — recovers localStorage-only brands on the client. */
export function useBrandQuery(id: string, options: Options = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.brands.detail(id),
    queryFn: () => getBrandById(id),
    initialData: initialData ?? undefined,
    // Force client revalidate when SSR only saw seed catalog.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled: enabled && Boolean(id),
  });
}
