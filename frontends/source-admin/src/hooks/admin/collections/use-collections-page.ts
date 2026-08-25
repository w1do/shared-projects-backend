"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Collection } from "@/lib/admin/mocks/types";
import { useCollectionsQuery } from "./use-collections-query";
import {
  useDeleteCollectionMutation,
  useToggleCollectionFeaturedMutation,
} from "./use-collection-mutations";

type UseCollectionsPageOptions = {
  /**
   * Optional seed (e.g. tests). Prefer omitting so isPending drives the
   * full-page skeleton on first paint, matching the products pattern.
   */
  initialCollections?: Collection[];
};

/** Collections list page data + delete / featured / navigation. */
export function useCollectionsPage(options: UseCollectionsPageOptions = {}) {
  const { initialCollections } = options;
  const hasSeed = initialCollections !== undefined;
  const router = useRouter();

  const { data, isPending } = useCollectionsQuery({
    initialData: hasSeed ? initialCollections : undefined,
  });
  const collections = data ?? initialCollections ?? [];

  const deleteMutation = useDeleteCollectionMutation();
  const toggleFeaturedMutation = useToggleCollectionFeaturedMutation();

  const openAdd = () => {
    router.push("/admin/collections/add");
  };

  const openEdit = (collection: Collection) => {
    router.push(`/admin/collections/${collection.id}/edit`);
  };

  const deleteCollectionById = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success("Collection deleted."),
      onError: () => toast.error("Could not delete collection."),
    });
  };

  const toggleFeatured = (id: string) => {
    toggleFeaturedMutation.mutate(id, {
      onSuccess: (next) => {
        const target = next.find((collection) => collection.id === id);
        if (!target) return;
        toast.success(
          target.featured
            ? `Collection "${target.name}" is now featured on home screen.`
            : `Collection "${target.name}" removed from featured items.`,
        );
      },
      onError: () => toast.error("Could not update featured state."),
    });
  };

  return {
    collections,
    /** No cached data yet — show full-page CollectionsLoadingState. */
    isPending: hasSeed ? false : isPending,
    openAdd,
    openEdit,
    deleteCollectionById,
    toggleFeatured,
    isBusy: deleteMutation.isPending || toggleFeaturedMutation.isPending,
  };
}
