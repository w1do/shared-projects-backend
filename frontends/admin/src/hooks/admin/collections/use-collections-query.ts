"use client";

import { useQuery } from "@tanstack/react-query";
import type { Collection } from "@/lib/admin/mocks/types";
import { listCollections } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type UseCollectionsQueryOptions = {
  /** Optional seed (tests/SSR). Prefer omitting so isPending drives the skeleton. */
  initialData?: Collection[];
  enabled?: boolean;
};

export function useCollectionsQuery(options: UseCollectionsQueryOptions = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.collections.list(),
    queryFn: listCollections,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
