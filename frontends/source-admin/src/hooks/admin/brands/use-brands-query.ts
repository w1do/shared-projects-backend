"use client";

import { useQuery } from "@tanstack/react-query";
import type { Brand } from "@/lib/admin/mocks/types";
import { listBrands } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type UseBrandsQueryOptions = {
  initialData?: Brand[];
  enabled?: boolean;
};

export function useBrandsQuery(options: UseBrandsQueryOptions = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.brands.list(),
    queryFn: listBrands,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
