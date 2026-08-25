"use client";

import type { Article } from "@/lib/admin/mocks/magazine";
import { useArticleQuery } from "./use-article-query";

type Options = {
  slug: string;
  initialArticle?: Article | null;
};

/**
 * Edit article page data boundary.
 * Prefer SSR/local seed while Query revalidates; only show empty when truly missing.
 */
export function useEditArticlePage(options: Options) {
  const { slug, initialArticle = null } = options;
  const {
    data: article,
    isPending,
    isError,
    isFetched,
  } = useArticleQuery(slug, {
    initialData: initialArticle ?? undefined,
  });

  const resolved = article ?? initialArticle ?? null;
  const isResolving = !resolved && isPending && !isFetched;
  const notFound = !resolved && isFetched && (isError || article == null);

  return {
    article: resolved,
    isResolving,
    notFound,
  };
}
