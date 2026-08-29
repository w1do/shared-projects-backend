"use client";

import { useQuery } from "@tanstack/react-query";
import type { Article } from "@/lib/admin/types/magazine";
import { listArticles } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = { initialData?: Article[]; enabled?: boolean };

export function useArticlesQuery(options: Options = {}) {
  const { initialData, enabled = true } = options;
  return useQuery({
    queryKey: adminQueryKeys.articles.list(),
    queryFn: listArticles,
    initialData,
    // Always re-read localStorage-backed stores on the client.
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled,
  });
}
