"use client";

import { useQuery } from "@tanstack/react-query";
import { getDashboardData, type AdminDashboardData } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = { initialData?: AdminDashboardData; enabled?: boolean };

export function useDashboardQuery(options: Options = {}) {
  const { initialData, enabled = true } = options;
  return useQuery({
    queryKey: adminQueryKeys.dashboard.data(),
    queryFn: getDashboardData,
    initialData,
    // Always revalidate on client so mock widgets track localStorage catalog changes.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
