"use client";

import { useQuery } from "@tanstack/react-query";
import { getBootstrap } from "@/lib/admin/data-source/platform/auth";
import { canManageLicensing } from "@/lib/admin/data-source/platform/licensing-access";
import { getProjectKey } from "@/lib/admin/data-source/session";
import { adminQueryKeys } from "@/lib/admin/query/keys";

export type LicensingAccess = {
  /** Право `pay.licensing.manage` (или `*`): без него раздел только читает. */
  canManage: boolean;
};

/**
 * Право оператора управлять лицензированием — из bootstrap, тем же вызовом,
 * что и в остальной панели (успешный ответ заодно обновляет снимок разделов).
 */
export function useLicensingAccessQuery() {
  return useQuery({
    queryKey: adminQueryKeys.licensing.access(),
    queryFn: async (): Promise<LicensingAccess> => {
      const bootstrap = await getBootstrap(getProjectKey());
      return { canManage: canManageLicensing(bootstrap.permissions) };
    },
  });
}
