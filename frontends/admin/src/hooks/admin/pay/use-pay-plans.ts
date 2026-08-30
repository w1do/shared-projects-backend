"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { payPlans, type UpsertPayPlanInput } from "@/lib/admin/services/pay";

/** Тарифные планы подписок: курсорная пагинация платформы. */
export function usePayPlans() {
  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.pay.plans(),
    queryFn: ({ pageParam }) => payPlans.list(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

function useInvalidatePlans() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: adminQueryKeys.pay.all });
}

export function useCreatePayPlanMutation() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: (input: UpsertPayPlanInput) => payPlans.create(input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.plans.toast.created"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.plans.toast.save-failed")),
  });
}

export function useUpdatePayPlanMutation() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpsertPayPlanInput }) =>
      payPlans.update(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.plans.toast.updated"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.plans.toast.save-failed")),
  });
}

export function useArchivePayPlanMutation() {
  const invalidate = useInvalidatePlans();

  return useMutation({
    mutationFn: (id: number) => payPlans.archive(id),
    onSuccess: () => {
      void invalidate();
      toast.success(t("console.plans.toast.archived"));
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.plans.toast.archive-failed")),
  });
}
