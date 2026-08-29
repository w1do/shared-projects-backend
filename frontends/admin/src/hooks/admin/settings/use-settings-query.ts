"use client";

import { useQuery } from "@tanstack/react-query";
import type { StoreSettings } from "@/lib/admin/types/settings";
import { getStoreSettings } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = { initialData?: StoreSettings; enabled?: boolean };

export function useStoreSettingsQuery(options: Options = {}) {
  const { initialData, enabled = true } = options;
  return useQuery({
    queryKey: adminQueryKeys.settings.store(),
    queryFn: getStoreSettings,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
