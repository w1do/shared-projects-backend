"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminNotification } from "@/lib/admin/mocks/notifications";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

async function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: adminQueryKeys.notifications.all });
}

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.notifications.all });
      const previous = queryClient.getQueryData<AdminNotification[]>(
        adminQueryKeys.notifications.list(),
      );
      queryClient.setQueryData<AdminNotification[]>(
        adminQueryKeys.notifications.list(),
        (current = []) => current.map((n) => (n.id === id ? { ...n, read: true } : n)),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(adminQueryKeys.notifications.list(), ctx.previous);
      }
    },
    onSettled: async () => invalidate(queryClient),
  });
}

export function useMarkAllNotificationsReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.notifications.all });
      const previous = queryClient.getQueryData<AdminNotification[]>(
        adminQueryKeys.notifications.list(),
      );
      queryClient.setQueryData<AdminNotification[]>(
        adminQueryKeys.notifications.list(),
        (current = []) => current.map((n) => ({ ...n, read: true })),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(adminQueryKeys.notifications.list(), ctx.previous);
      }
    },
    onSettled: async () => invalidate(queryClient),
  });
}
