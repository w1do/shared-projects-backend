"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { usePromotionsQuery } from "./use-promotions-query";
import {
  useCreatePromotionMutation,
  useDeletePromotionMutation,
  useUpdatePromotionMutation,
  useUpdatePromotionStatusMutation,
} from "./use-promotion-mutations";

type Options = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the catalog list pattern.
   */
  initialPromotions?: Promotion[];
  autoOpenCreate?: boolean;
};

/** Promotions page data + CRUD actions via TanStack Query. */
export function usePromotionsPage(options: Options = {}) {
  const { initialPromotions, autoOpenCreate = false } = options;
  const hasSeed = initialPromotions !== undefined;

  const { data, isPending } = usePromotionsQuery({
    initialData: hasSeed ? initialPromotions : undefined,
  });
  const promotions = useMemo(() => data ?? initialPromotions ?? [], [data, initialPromotions]);

  const createMutation = useCreatePromotionMutation();
  const updateMutation = useUpdatePromotionMutation();
  const statusMutation = useUpdatePromotionStatusMutation();
  const deleteMutation = useDeletePromotionMutation();

  const [detailPromotion, setDetailPromotion] = useState<Promotion | null>(null);
  const [formPromotion, setFormPromotion] = useState<Promotion | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openCreate = () => {
    setFormPromotion(null);
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (!autoOpenCreate) return;
    openCreate();
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("new");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [autoOpenCreate]);

  const spotlight = useMemo(
    () => promotions.find((promo) => promo.featured) ?? promotions[0],
    [promotions],
  );

  const viewDetails = (promotion: Promotion) => setDetailPromotion(promotion);

  const openEdit = (promotion: Promotion) => {
    setDetailPromotion(null);
    setFormPromotion(promotion);
    setIsFormOpen(true);
  };

  const submitPromotion = async (promotion: Promotion) => {
    try {
      if (promotions.some((p) => p.id === promotion.id)) {
        await updateMutation.mutateAsync(promotion);
      } else {
        await createMutation.mutateAsync(promotion);
      }
    } catch {
      toast.error("Could not save promotion.");
    }
  };

  const toggleStatus = (promotion: Promotion) => {
    const nextStatus = promotion.status === "Paused" ? "Active" : "Paused";
    statusMutation.mutate(
      { id: promotion.id, status: nextStatus },
      {
        onSuccess: () => {
          setDetailPromotion((current) =>
            current && current.id === promotion.id ? { ...current, status: nextStatus } : current,
          );
          toast.success(`${promotion.code} ${nextStatus === "Active" ? "resumed" : "paused"}`);
        },
        onError: () => toast.error("Could not update promotion status."),
      },
    );
  };

  const removePromotion = (promotion: Promotion) => {
    deleteMutation.mutate(promotion.id, {
      onSuccess: () => toast.success(`${promotion.code} removed from the calendar`),
      onError: () => toast.error("Could not delete promotion."),
    });
  };

  return {
    promotions,
    spotlight,
    /** No cached data yet — show full-page PromotionsLoadingState. */
    isPending: hasSeed ? false : isPending,
    detailPromotion,
    setDetailPromotion,
    formPromotion,
    isFormOpen,
    setIsFormOpen,
    openCreate,
    viewDetails,
    openEdit,
    submitPromotion,
    toggleStatus,
    removePromotion,
  };
}
