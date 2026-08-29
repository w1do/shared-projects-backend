"use client";

import { useQuery } from "@tanstack/react-query";
import type { Article } from "@/lib/admin/types/magazine";
import { getArticleBySlug } from "@/lib/admin/services";
import { adminQueryKeys } from "@/lib/admin/query/keys";

type Options = {
  initialData?: Article | null;
  enabled?: boolean;
};

export function useArticleQuery(slug: string, options: Options = {}) {
  const { initialData, enabled = true } = options;

  return useQuery({
    queryKey: adminQueryKeys.articles.detail(slug),
    queryFn: () => getArticleBySlug(slug),
    initialData: initialData ?? undefined,
    initialDataUpdatedAt: initialData ? 0 : undefined,
    enabled: enabled && Boolean(slug),
  });
}
