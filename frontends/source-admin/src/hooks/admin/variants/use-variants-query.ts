"use client";

import { useQuery } from "@tanstack/react-query";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { listVariantConfigs } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = { initialData?: ProductVariantConfig[]; enabled?: boolean };

export function useVariantsQuery(options: Options = {}) {
  const { initialData, enabled = true } = options;
  return useQuery({
    queryKey: adminQueryKeys.variants.list(),
    queryFn: listVariantConfigs,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
