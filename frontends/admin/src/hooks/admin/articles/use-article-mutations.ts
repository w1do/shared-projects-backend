"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import type { Article } from "@/lib/admin/types/magazine";
import {
  changeArticleStatus,
  createArticle,
  deleteArticle,
  deleteArticleRevision,
  listArticleRevisions,
  restoreArticleRevision,
  updateArticle,
} from "@/lib/admin/services";
import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type QueryClient = ReturnType<typeof useQueryClient>;

async function invalidate(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: adminQueryKeys.articles.all });
}

export function useCreateArticleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BlogFormValues) => createArticle(values),
    onSettled: async () => invalidate(queryClient),
  });
}

export function useUpdateArticleMutation(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BlogFormValues) => updateArticle(articleId, values),
    onSettled: async () => invalidate(queryClient),
  });
}

export function useDeleteArticleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.articles.all });
      const previous = queryClient.getQueryData<Article[]>(adminQueryKeys.articles.list());
      queryClient.setQueryData<Article[]>(adminQueryKeys.articles.list(), (current = []) =>
        current.filter((article) => article.id !== id),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(adminQueryKeys.articles.list(), ctx.previous);
      }
    },
    onSettled: async () => invalidate(queryClient),
  });
}

/** Смена статуса поста; допустимость перехода решает платформа. */
export function useChangeArticleStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => changeArticleStatus(id, status),
    onSettled: () => invalidate(queryClient),
  });
}

export function useArticleRevisionsQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: [...adminQueryKeys.articles.all, "revisions", id] as const,
    queryFn: () => listArticleRevisions(id),
    enabled: enabled && id !== "",
  });
}

export function useRestoreArticleRevisionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, revisionId }: { id: string; revisionId: string }) =>
      restoreArticleRevision(id, revisionId),
    onSettled: () => invalidate(queryClient),
  });
}

export function useDeleteArticleRevisionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, revisionId }: { id: string; revisionId: string }) =>
      deleteArticleRevision(id, revisionId),
    onSettled: () => invalidate(queryClient),
  });
}
