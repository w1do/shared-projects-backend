"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { AdminNotification } from "@/lib/admin/mocks/notifications";
import { groupNotifications } from "@/components/pages/notifications/utils";
import type { TypeFilter } from "@/components/pages/notifications/config/filters";
import { useNotificationsQuery } from "./use-notifications-query";
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "./use-notification-mutations";

type Options = { initialNotifications?: AdminNotification[] };

export function useNotificationsPage(options: Options = {}) {
  const { initialNotifications } = options;
  const hasSeed = initialNotifications !== undefined;

  const { data, isPending, isLoading, isError, isFetching, refetch } = useNotificationsQuery({
    initialData: hasSeed ? initialNotifications : undefined,
  });

  const notifications = useMemo(
    () => data ?? initialNotifications ?? [],
    [data, initialNotifications],
  );
  const markReadMutation = useMarkNotificationReadMutation();
  const markAllMutation = useMarkAllNotificationsReadMutation();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const groups = useMemo(
    () => groupNotifications(notifications, { typeFilter, unreadOnly }),
    [notifications, typeFilter, unreadOnly],
  );

  const markRead = (id: string) => {
    markReadMutation.mutate(id);
  };

  const markAllRead = () => {
    if (unreadCount === 0) return;
    markAllMutation.mutate(undefined, {
      onSuccess: () => toast.success("All notifications marked as read"),
    });
  };

  return {
    notifications,
    groups,
    unreadCount,
    typeFilter,
    setTypeFilter,
    unreadOnly,
    setUnreadOnly,
    markRead,
    markAllRead,
    isPending: hasSeed ? false : isPending,
    isLoading,
    isError,
    isFetching,
    retry: () => {
      void refetch();
    },
  };
}
