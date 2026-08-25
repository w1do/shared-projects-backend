"use client";

import { useQuery } from "@tanstack/react-query";
import type { Category } from "@/lib/admin/mocks/types";
import { listCategories } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type UseCategoriesQueryOptions = {
  /** Optional seed (e.g. tests). Prefer omitting so isPending drives skeleton. */
  initialData?: Category[];
  enabled?: boolean;
};

export function useCategoriesQuery(options: UseCategoriesQueryOptions = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.categories.list(),
    queryFn: listCategories,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
