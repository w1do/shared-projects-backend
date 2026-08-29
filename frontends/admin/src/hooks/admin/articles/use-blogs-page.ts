"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Article } from "@/lib/admin/types/magazine";
import { t, tf } from "@/lib/admin/console-texts";
import { useArticlesQuery } from "./use-articles-query";
import { useDeleteArticleMutation } from "./use-article-mutations";

type Options = { initialArticles?: Article[] };

/** Blogs list page data + delete/preview/navigation via TanStack Query. */
export function useBlogsPage(options: Options = {}) {
  const { initialArticles } = options;
  const hasSeed = initialArticles !== undefined;
  const router = useRouter();

  const { data, isPending, isLoading, isError, isFetching, refetch } = useArticlesQuery({
    initialData: hasSeed ? initialArticles : undefined,
  });

  const articles = useMemo(() => data ?? initialArticles ?? [], [data, initialArticles]);
  const deleteMutation = useDeleteArticleMutation();
  const [previewArticle, setPreviewArticle] = useState<Article | null>(null);

  const featured = useMemo(() => articles[0] ?? null, [articles]);
  const rest = useMemo(() => articles.slice(1), [articles]);

  const openPreview = (article: Article) => setPreviewArticle(article);
  const closePreview = () => setPreviewArticle(null);

  const openEdit = (article: Article) => {
    router.push(`/admin/blogs/${article.slug}/edit`);
  };

  const openCreate = () => {
    router.push("/admin/blogs/add");
  };

  const removeArticle = (article: Article) => {
    deleteMutation.mutate(article.id, {
      onSuccess: () => toast.success(tf("console.blogs.toast.deleted", { title: article.title })),
      onError: () => toast.error(t("console.blogs.toast.delete-failed")),
    });
  };

  return {
    articles,
    featured,
    rest,
    previewArticle,
    openPreview,
    closePreview,
    openEdit,
    openCreate,
    removeArticle,
    isPending: hasSeed ? false : isPending,
    isLoading,
    isError,
    isFetching,
    retry: () => {
      void refetch();
    },
  };
}
