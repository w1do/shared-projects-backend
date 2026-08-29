"use client";

import { useQuery } from "@tanstack/react-query";
import type { Category } from "@/lib/admin/types/catalog";
import { getCategoryById } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = {
  initialData?: Category | null;
  enabled?: boolean;
};

export function useCategoryQuery(id: string, options: Options = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.categories.detail(id),
    queryFn: () => getCategoryById(id),
    initialData: initialData ?? undefined,
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled: enabled && Boolean(id),
  });
}
