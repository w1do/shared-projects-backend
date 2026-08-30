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
  payments,
  type PaymentStatusFilter,
  type RefundPaymentInput,
} from "@/lib/admin/services/pay";

/** Транзакции оплат: курсорная пагинация платформы как infinite query. */
export function usePayments(status?: PaymentStatusFilter) {
  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.pay.payments({ status }),
    queryFn: ({ pageParam }) => payments.list({ status, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

function useInvalidatePayments() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.pay.all });
}

export function useConfirmPaymentMutation() {
  const invalidate = useInvalidatePayments();

  return useMutation({
    mutationFn: (id: string) => payments.confirm(id),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.payments.toast.confirmed"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.payments.toast.confirm-failed")),
  });
}

export function useRefundPaymentMutation() {
  const invalidate = useInvalidatePayments();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RefundPaymentInput }) =>
      payments.refund(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.payments.toast.refunded"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.payments.toast.refund-failed")),
  });
}
