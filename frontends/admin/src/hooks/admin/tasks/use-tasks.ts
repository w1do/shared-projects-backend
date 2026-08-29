"use client";

import { useQuery } from "@tanstack/react-query";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { tasks, type TaskFilter } from "@/lib/admin/services";
import { taskPollInterval } from "@/lib/admin/data-source/platform/task-poll";

/**
 * Фоновые задачи проекта. Пока есть работа — список перечитывается часто,
 * в покое опрос выключен.
 */
export function useTasksQuery(filter: TaskFilter = {}) {
  return useQuery({
    queryKey: adminQueryKeys.tasks.list(filter),
    queryFn: () => tasks.list(filter),
    refetchInterval: (query) => taskPollInterval(query.state.data),
  });
}
