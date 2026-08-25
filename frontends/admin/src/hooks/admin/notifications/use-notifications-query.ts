"use client";

import { useQuery } from "@tanstack/react-query";
import type { AdminNotification } from "@/lib/admin/mocks/notifications";
import { listNotifications } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = { initialData?: AdminNotification[]; enabled?: boolean };

export function useNotificationsQuery(options: Options = {}) {
  const { initialData, enabled = true } = options;
  return useQuery({
    queryKey: adminQueryKeys.notifications.list(),
    queryFn: listNotifications,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
