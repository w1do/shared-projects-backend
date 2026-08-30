"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import {
  subscriptions,
  type SubscriptionAction,
} from "@/lib/admin/services/pay";

/** Подписки проекта: отбор по типу предмета, курсорная пагинация. */
export function useSubscriptions(subjectType?: string) {
  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.pay.subscriptions({ subjectType }),
    queryFn: ({ pageParam }) =>
      subscriptions.list({ subjectType, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

export function useChangeSubscriptionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: SubscriptionAction }) =>
      subscriptions.change(id, action),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.pay.all });
      toast.success(t("console.subscriptions.toast.changed"));
    },
    onError: (error: Error) =>
      toast.error(
        error.message || t("console.subscriptions.toast.change-failed"),
      ),
  });
}
