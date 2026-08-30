"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { t } from "@/lib/admin/console-texts";
import {
  lastFailedTaskOf,
  runningTaskOf,
} from "@/lib/admin/data-source/platform/task-poll";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { cities } from "@/lib/admin/services";
import { useTasksQuery } from "@/hooks/admin/tasks";

/**
 * Адаптация SEO городов по AI: запуск, ход задачи из реестра платформы и
 * обновление таблицы по её завершении. Состояние переживает перезагрузку —
 * оно читается из реестра, а не хранится во вкладке.
 */
export function useCitySeoAdaptation() {
  const queryClient = useQueryClient();
  const tasks = useTasksQuery({
    kind: "city_seo_adaptation",
    subjectType: "project",
  });

  const runningTask = runningTaskOf(tasks.data);
  const failedTask = runningTask ? undefined : lastFailedTaskOf(tasks.data);
  const wasRunning = React.useRef(false);

  React.useEffect(() => {
    if (wasRunning.current && !runningTask) {
      void queryClient.invalidateQueries({
        queryKey: adminQueryKeys.cities.all,
      });
      toast.success(t("console.cities.adapt.finished"));
    }
    wasRunning.current = runningTask !== undefined;
  }, [runningTask, queryClient]);

  const start = useMutation({
    mutationFn: (topic: string) => cities.adaptSeo(topic),
    onSuccess: async () => {
      toast.success(t("console.cities.adapt.started"));
      await queryClient.invalidateQueries({
        queryKey: adminQueryKeys.tasks.all,
      });
    },
    onError: (error: Error) =>
      toast.error(error.message || t("console.cities.adapt.start-failed")),
  });

  return {
    start: (topic: string, options?: { onSuccess?: () => void }) =>
      start.mutate(topic, { onSuccess: options?.onSuccess }),
    isStarting: start.isPending,
    runningTask,
    failedTask,
  };
}
