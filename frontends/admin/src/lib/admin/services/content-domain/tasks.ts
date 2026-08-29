/** Фоновые задачи проекта — фасад слоя данных для хуков консоли. */

import { listTasks, type TaskFilter } from "@/lib/admin/data-source/platform/tasks";

export type { PlatformTask, PlatformTaskState, TaskFilter } from "@/lib/admin/data-source/platform/tasks";

export const tasks = {
  list: (filter: TaskFilter = {}) => listTasks(filter),
};
