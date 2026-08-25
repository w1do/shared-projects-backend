"use client";

import { useQuery } from "@tanstack/react-query";
import type { Collection } from "@/lib/admin/mocks/types";
import { getCollectionById } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = {
  initialData?: Collection | null;
  enabled?: boolean;
};

export function useCollectionQuery(id: string, options: Options = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.collections.detail(id),
    queryFn: () => getCollectionById(id),
    initialData: initialData ?? undefined,
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled: enabled && Boolean(id),
  });
}
