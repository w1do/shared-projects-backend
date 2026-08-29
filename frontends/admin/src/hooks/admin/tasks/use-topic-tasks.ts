"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { adminQueryKeys } from "@/lib/admin/query/keys";
import { isTaskRunning } from "@/lib/admin/data-source/platform/task-poll";
import { useTasksQuery } from "./use-tasks";
import type { PlatformTask } from "@/lib/admin/services";

/** Задачи написания постов: одна выдача на весь список тем, а не запрос на строку. */
export function useTopicTasksQuery() {
  const query = useTasksQuery({ kind: "post_generation", subjectType: "topic" });
  const queryClient = useQueryClient();

  const running = (query.data ?? [])
    .filter(isTaskRunning)
    .map((task) => task.id)
    .join(",");
  const previousRunning = React.useRef(running);

  React.useEffect(() => {
    // Задача закончилась или появилась новая — темы перечитываются, и раздел
    // сам приходит к обычному виду с готовым постом.
    if (previousRunning.current !== running) {
      previousRunning.current = running;
      void queryClient.invalidateQueries({ queryKey: adminQueryKeys.research.all });
    }
  }, [running, queryClient]);

  const byTopic = new Map<string, PlatformTask[]>();

  for (const task of query.data ?? []) {
    if (!task.subject_id) continue;
    byTopic.set(task.subject_id, [...(byTopic.get(task.subject_id) ?? []), task]);
  }

  return {
    ...query,
    tasksOfTopic: (topicId: number): PlatformTask[] => byTopic.get(String(topicId)) ?? [],
  };
}
