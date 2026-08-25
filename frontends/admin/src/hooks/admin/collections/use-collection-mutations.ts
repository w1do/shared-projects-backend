"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CollectionFormValues } from "@/lib/admin/schemas/catalog/collection-form-schema";
import type { Collection } from "@/lib/admin/mocks/types";
import {
  createCollection,
  deleteCollection,
  toggleCollectionFeatured,
  updateCollection,
} from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type QueryClient = ReturnType<typeof useQueryClient>;

function setCollectionsCache(queryClient: QueryClient, collections: Collection[]) {
  queryClient.setQueryData<Collection[]>(adminQueryKeys.collections.list(), collections);
}

export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CollectionFormValues) => createCollection(values),
    onSuccess: (collection) => {
      queryClient.setQueryData<Collection[]>(adminQueryKeys.collections.list(), (current = []) => {
        const without = current.filter((item) => item.id !== collection.id);
        return [collection, ...without];
      });
      queryClient.setQueryData(adminQueryKeys.collections.detail(collection.id), collection);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.collections.all });
    },
  });
}

export function useUpdateCollectionMutation(collectionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CollectionFormValues) => updateCollection(collectionId, values),
    onSuccess: (collection) => {
      if (!collection) return;
      queryClient.setQueryData<Collection[]>(adminQueryKeys.collections.list(), (current = []) =>
        current.map((item) => (item.id === collection.id ? collection : item)),
      );
      queryClient.setQueryData(adminQueryKeys.collections.detail(collection.id), collection);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.collections.all });
    },
  });
}

export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.collections.all });
      const previous = queryClient.getQueryData<Collection[]>(adminQueryKeys.collections.list());
      queryClient.setQueryData<Collection[]>(adminQueryKeys.collections.list(), (current = []) =>
        current.filter((collection) => collection.id !== id),
      );
      queryClient.removeQueries({ queryKey: adminQueryKeys.collections.detail(id) });
      return { previous };
    },
    onError: (_error, _id, context) => {
      if (context?.previous) setCollectionsCache(queryClient, context.previous);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.collections.all });
    },
  });
}

export function useToggleCollectionFeaturedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      const current =
        queryClient.getQueryData<Collection[]>(adminQueryKeys.collections.list()) ?? [];
      return toggleCollectionFeatured(id, current);
    },
    onSuccess: (next) => {
      setCollectionsCache(queryClient, next);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.collections.all });
    },
  });
}
