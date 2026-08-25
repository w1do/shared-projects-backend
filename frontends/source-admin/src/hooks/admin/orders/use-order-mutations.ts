"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { updateOrderStatus } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      patchedOrder,
    }: {
      id: string;
      status: DetailedOrder["status"];
      patchedOrder: DetailedOrder;
    }) => updateOrderStatus(id, status, patchedOrder),
    onSuccess: (order, variables) => {
      const next = order ?? variables.patchedOrder;
      queryClient.setQueryData<DetailedOrder[]>(adminQueryKeys.orders.list(), (current = []) =>
        current.map((item) => (item.id === variables.id ? next : item)),
      );
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.orders.all });
    },
  });
}
