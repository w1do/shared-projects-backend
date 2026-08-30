"use client";

import * as React from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import {
  lastFailedTaskOf,
  runningTaskOf,
} from "@/lib/admin/data-source/platform/task-poll";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { seoCatalog } from "@/lib/admin/services";
import type {
  SeoCatalogFilters,
  SeoRebuildTarget,
} from "@/lib/admin/services/content-domain/seo-catalog";
import { useTasksQuery } from "@/hooks/admin/tasks";

/** Каталог SEO проекта: отбор по типу, сортировка, курсорная пагинация. */
export function useSeoCatalog(filters: Omit<SeoCatalogFilters, "cursor">) {
  const query = useInfiniteQuery({
    queryKey: adminQueryKeys.seo.catalog(filters),
    queryFn: ({ pageParam }) =>
      seoCatalog.list({ ...filters, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
  };
}

/**
 * Пересборка SEO по AI: запуск, ход задачи и обновление каталога по её
 * завершении. Пока задача идёт, повторный запуск не предлагается.
 */
export function useSeoRebuild() {
  const queryClient = useQueryClient();
  const tasks = useTasksQuery({ kind: "seo_rebuild", subjectType: "project" });

  const runningTask = runningTaskOf(tasks.data);
  const failedTask = runningTask ? undefined : lastFailedTaskOf(tasks.data);
  const wasRunning = React.useRef(false);

  React.useEffect(() => {
    if (wasRunning.current && !runningTask) {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.seo.all });
      toast.success(t("console.seo.rebuild.finished"));
    }
    wasRunning.current = runningTask !== undefined;
  }, [runningTask, queryClient]);

  const start = useMutation({
    mutationFn: (entities: SeoRebuildTarget[]) => seoCatalog.rebuild(entities),
    onSuccess: async () => {
      toast.success(t("console.seo.rebuild.started"));
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.tasks.all,
      });
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.seo.rebuild.start-failed")),
  });

  return {
    start: (entities: SeoRebuildTarget[]) => start.mutate(entities),
    isStarting: start.isPending,
    runningTask,
    failedTask,
  };
}
