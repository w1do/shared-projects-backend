"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { rebuildArticle } from "@/lib/admin/services";
import { useTasksQuery } from "@/hooks/admin/tasks";
import { t } from "@/lib/admin/console-texts";
import {
  lastFailedTaskOf,
  runningTaskOf,
} from "@/lib/admin/data-source/platform/task-poll";

/**
 * Пересборка поста через AI: запуск, ход задачи и обновление поста по её
 * завершении. Пока задача в работе, повторный запуск не предлагается.
 */
export function usePostRebuild(articleId: string) {
  const queryClient = useQueryClient();
  const tasks = useTasksQuery({
    kind: "post_rebuild",
    subjectType: "post",
    subjectId: articleId,
  });

  const runningTask = runningTaskOf(tasks.data);
  const failedTask = runningTask ? undefined : lastFailedTaskOf(tasks.data);
  const wasRunning = React.useRef(false);

  React.useEffect(() => {
    // Задача закончилась — пост перечитывается, и форма показывает новый текст.
    if (wasRunning.current && !runningTask) {
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.articles.all });
      toast.success(t("console.blogs.rebuild.finished"));
    }
    wasRunning.current = runningTask !== undefined;
  }, [runningTask, queryClient]);

  const start = useMutation({
    mutationFn: () => rebuildArticle(articleId),
    onSuccess: async () => {
      toast.success(t("console.blogs.rebuild.started"));
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tasks.all });
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.blogs.rebuild.start-failed")),
  });

  return {
    start: () => start.mutate(),
    isStarting: start.isPending,
    runningTask,
    failedTask,
  };
}
