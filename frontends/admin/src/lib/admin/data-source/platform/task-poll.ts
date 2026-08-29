import type { PlatformTask } from "./tasks";

/** Пока задача в работе, консоль спрашивает платформу часто. */
export const TASK_POLL_MS = 3000;

export function isTaskRunning(task: PlatformTask): boolean {
  return task.state === "queued" || task.state === "running";
}

/**
 * Интервал опроса по составу списка: есть работа — опрашиваем, нет — молчим.
 * `false` — TanStack Query это понимает как «опрос выключен».
 */
export function taskPollInterval(tasks: PlatformTask[] | undefined): number | false {
  if (!tasks || tasks.length === 0) return false;

  return tasks.some(isTaskRunning) ? TASK_POLL_MS : false;
}

/**
 * Число задач для индикатора в панели: ноль — индикатор не показывается.
 * Недоступный реестр даёт `undefined` — это тоже ноль, панель работает как обычно.
 */
export function runningTaskCount(tasks: PlatformTask[] | undefined): number {
  return (tasks ?? []).filter(isTaskRunning).length;
}

/** Задача, из-за которой предмет сейчас занят: она в очереди или выполняется. */
export function runningTaskOf(tasks: PlatformTask[] | undefined): PlatformTask | undefined {
  return (tasks ?? []).find(isTaskRunning);
}

/** Последний отказ по предмету: показывается, пока задача не запущена заново. */
export function lastFailedTaskOf(tasks: PlatformTask[] | undefined): PlatformTask | undefined {
  return (tasks ?? []).find((task) => task.state === "failed");
}
