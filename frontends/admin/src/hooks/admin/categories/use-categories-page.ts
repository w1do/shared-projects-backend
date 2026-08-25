"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Category } from "@/lib/admin/mocks/types";
import { useCategoriesQuery } from "./use-categories-query";
import { useDeleteCategoryMutation, useMoveCategoryMutation } from "./use-category-mutations";

type UseCategoriesPageOptions = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the products/dashboard pattern.
   */
  initialCategories?: Category[];
};

type DeleteIntent =
  | { type: "single"; category: Category }
  | { type: "bulk"; ids: string[]; names: string[] };

/**
 * Categories list page data + delete confirmation (single / bulk).
 * Exposes isPending so the page can render CategoriesLoadingState.
 */
export function useCategoriesPage(options: UseCategoriesPageOptions = {}) {
  const { initialCategories } = options;
  const hasSeed = initialCategories !== undefined;
  const router = useRouter();

  const { data, isPending } = useCategoriesQuery({
    initialData: hasSeed ? initialCategories : undefined,
  });
  const categories = useMemo(() => data ?? initialCategories ?? [], [data, initialCategories]);

  const deleteMutation = useDeleteCategoryMutation();
  const [deleteIntent, setDeleteIntent] = useState<DeleteIntent | null>(null);
  const moveMutation = useMoveCategoryMutation();
  const [moveTarget, setMoveTarget] = useState<Category | null>(null);

  const openEdit = useCallback(
    (category: Category) => {
      router.push(`/admin/categories/${category.id}/edit`);
    },
    [router],
  );

  const requestDelete = useCallback(
    (id: string) => {
      const category = categories.find((item) => item.id === id);
      if (!category) return;
      setDeleteIntent({ type: "single", category });
    },
    [categories],
  );

  const requestBulkDelete = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      const selected = categories.filter((item) => ids.includes(item.id));
      if (selected.length === 0) return;
      setDeleteIntent({
        type: "bulk",
        ids: selected.map((item) => item.id),
        names: selected.map((item) => item.name),
      });
    },
    [categories],
  );

  const cancelDelete = useCallback(() => {
    if (deleteMutation.isPending) return;
    setDeleteIntent(null);
  }, [deleteMutation.isPending]);

  const confirmDelete = useCallback(() => {
    if (!deleteIntent) return;

    if (deleteIntent.type === "single") {
      const { category } = deleteIntent;
      deleteMutation.mutate(category.id, {
        onSuccess: () => {
          toast.success(`Category "${category.name}" deleted.`);
          setDeleteIntent(null);
        },
        // Текст платформы понятнее общего: там причина отказа (права, валидация).
        onError: (error: Error) => toast.error(error.message || "Could not delete category."),
      });
      return;
    }

    const { ids } = deleteIntent;
    let remaining = ids.length;
    let failed = 0;

    ids.forEach((id) => {
      deleteMutation.mutate(id, {
        onSettled: () => {
          remaining -= 1;
          if (remaining > 0) return;
          if (failed > 0) {
            toast.error("Some categories could not be deleted.");
          } else {
            toast.success(`${ids.length} categor${ids.length > 1 ? "ies" : "y"} deleted.`);
          }
          setDeleteIntent(null);
        },
        onError: () => {
          failed += 1;
        },
      });
    });
  }, [deleteIntent, deleteMutation]);

  const requestMove = useCallback((category: Category) => setMoveTarget(category), []);

  /** Перемещение перетаскиванием: без диалога, с позицией среди соседей. */
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());
  const moveNode = useCallback(
    (nodeId: string, parentId: string | null, position: number) => {
      const node = categories.find((category) => category.id === nodeId);
      setMovingIds((current) => new Set(current).add(nodeId));
      moveMutation.mutate(
        { id: nodeId, parentId, position },
        {
          onSuccess: () => toast.success(`Category "${node?.name ?? nodeId}" moved.`),
          onError: (error: Error) => toast.error(error.message || "Could not move category."),
          onSettled: () =>
            setMovingIds((current) => {
              const next = new Set(current);
              next.delete(nodeId);
              return next;
            }),
        },
      );
    },
    [categories, moveMutation],
  );

  const cancelMove = useCallback(() => {
    if (moveMutation.isPending) return;
    setMoveTarget(null);
  }, [moveMutation.isPending]);

  /** `parentId` пустой строкой означает перенос в корень. */
  const confirmMove = useCallback(
    (parentId: string) => {
      if (!moveTarget) return;
      const target = moveTarget;

      moveMutation.mutate(
        { id: target.id, parentId: parentId === "" ? null : parentId },
        {
          onSuccess: () => {
            toast.success(`Category "${target.name}" moved.`);
            setMoveTarget(null);
          },
          onError: (error: Error) => toast.error(error.message || "Could not move category."),
        },
      );
    },
    [moveTarget, moveMutation],
  );

  return {
    categories,
    /** No cached data yet — show full-page CategoriesLoadingState. */
    isPending: hasSeed ? false : isPending,
    openEdit,
    requestDelete,
    requestBulkDelete,
    deleteIntent,
    cancelDelete,
    confirmDelete,
    isDeleting: deleteMutation.isPending,
    requestMove,
    moveNode,
    movingIds,
    moveTarget,
    cancelMove,
    confirmMove,
    isMoving: moveMutation.isPending,
  };
}
