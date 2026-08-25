"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import type { Article } from "@/lib/admin/mocks/magazine";
import { createArticle, deleteArticle, updateArticle } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type QueryClient = ReturnType<typeof useQueryClient>;

async function invalidate(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: adminQueryKeys.articles.all });
}

export function useCreateArticleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BlogFormValues) => createArticle(values),
    onSuccess: (article) => {
      if (!article) return;
      queryClient.setQueryData<Article[]>(adminQueryKeys.articles.list(), (current = []) => {
        const without = current.filter((item) => item.id !== article.id);
        return [article, ...without];
      });
      if (article.slug) {
        queryClient.setQueryData(adminQueryKeys.articles.detail(article.slug), article);
      }
    },
    onSettled: async () => invalidate(queryClient),
  });
}

export function useUpdateArticleMutation(articleId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: BlogFormValues) => updateArticle(articleId, values),
    onSuccess: (article) => {
      if (!article) return;
      queryClient.setQueryData<Article[]>(adminQueryKeys.articles.list(), (current = []) =>
        current.map((item) => (item.id === article.id ? article : item)),
      );
      if (article.slug) {
        queryClient.setQueryData(adminQueryKeys.articles.detail(article.slug), article);
      }
    },
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
