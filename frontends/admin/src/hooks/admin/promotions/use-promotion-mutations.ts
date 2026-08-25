"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import {
  createPromotion,
  deletePromotion,
  updatePromotion,
  updatePromotionStatus,
} from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type QueryClient = ReturnType<typeof useQueryClient>;

function setList(queryClient: QueryClient, items: Promotion[]) {
  queryClient.setQueryData<Promotion[]>(adminQueryKeys.promotions.list(), items);
}

async function invalidate(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: adminQueryKeys.promotions.all });
}

export function useCreatePromotionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promotion: Promotion) => createPromotion(promotion),
    onSuccess: (promotion) => {
      queryClient.setQueryData<Promotion[]>(adminQueryKeys.promotions.list(), (current = []) => {
        const without = current.filter((p) => p.id !== promotion.id);
        return [promotion, ...without];
      });
    },
    onSettled: async () => invalidate(queryClient),
  });
}

export function useUpdatePromotionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promotion: Promotion) => updatePromotion(promotion.id, promotion),
    onSuccess: (promotion) => {
      if (!promotion) return;
      queryClient.setQueryData<Promotion[]>(adminQueryKeys.promotions.list(), (current = []) =>
        current.map((p) => (p.id === promotion.id ? promotion : p)),
      );
    },
    onSettled: async () => invalidate(queryClient),
  });
}

export function useUpdatePromotionStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Promotion["status"] }) =>
      updatePromotionStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.promotions.all });
      const previous = queryClient.getQueryData<Promotion[]>(adminQueryKeys.promotions.list());
      queryClient.setQueryData<Promotion[]>(adminQueryKeys.promotions.list(), (current = []) =>
        current.map((p) => (p.id === id ? { ...p, status } : p)),
      );
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) setList(queryClient, ctx.previous);
    },
    onSettled: async () => invalidate(queryClient),
  });
}

export function useDeletePromotionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePromotion(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.promotions.all });
      const previous = queryClient.getQueryData<Promotion[]>(adminQueryKeys.promotions.list());
      queryClient.setQueryData<Promotion[]>(adminQueryKeys.promotions.list(), (current = []) =>
        current.filter((p) => p.id !== id),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) setList(queryClient, ctx.previous);
    },
    onSettled: async () => invalidate(queryClient),
  });
}
