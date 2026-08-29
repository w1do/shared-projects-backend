"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Category } from "@/lib/admin/types/catalog";
import { t, tf } from "@/lib/admin/console-texts";
import { useCategoriesQuery } from "./use-categories-query";
import { useCategoryDelete } from "./use-category-delete";
import { useMoveCategoryMutation } from "./use-category-mutations";

type UseCategoriesPageOptions = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the products/dashboard pattern.
   */
  initialCategories?: Category[];
};

/**
 * Categories list page data + delete confirmation (single / bulk / purge).
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

  const remove = useCategoryDelete(categories);
  const moveMutation = useMoveCategoryMutation();
  const [moveTarget, setMoveTarget] = useState<Category | null>(null);

  const openEdit = useCallback(
    (category: Category) => {
      router.push(`/admin/categories/${category.id}/edit`);
    },
    [router],
  );

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
          onSuccess: () =>
            toast.success(tf("console.categories.move.done", { name: node?.name ?? nodeId })),
          onError: (error: Error) =>
            toast.error(error.message || t("console.categories.move.failed")),
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
            toast.success(tf("console.categories.move.done", { name: target.name }));
            setMoveTarget(null);
          },
          onError: (error: Error) =>
            toast.error(error.message || t("console.categories.move.failed")),
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
    ...remove,
    requestMove,
    moveNode,
    movingIds,
    moveTarget,
    cancelMove,
    confirmMove,
    isMoving: moveMutation.isPending,
  };
}
