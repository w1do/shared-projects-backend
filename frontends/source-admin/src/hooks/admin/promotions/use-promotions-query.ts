"use client";

import { useQuery } from "@tanstack/react-query";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { listPromotions } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = {
  /** Optional seed (e.g. tests). Prefer omitting so isPending drives the skeleton. */
  initialData?: Promotion[];
  enabled?: boolean;
};

export function usePromotionsQuery(options: Options = {}) {
  const { initialData, enabled = true } = options;
  return useQuery({
    queryKey: adminQueryKeys.promotions.list(),
    queryFn: listPromotions,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
