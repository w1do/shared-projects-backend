"use client";

import { useState } from "react";
import { Button } from "@/components/ui/inputs/button";
import { useTasksQuery } from "@/hooks/admin/tasks";
import { runningTaskCount } from "@/lib/admin/data-source/platform/task-poll";
import { tf } from "@/lib/admin/console-texts";
import { TasksDialog } from "@/components/layout/modals/TasksDialog";

/**
 * Индикатор фоновой работы в верхней панели.
 *
 * Без выполняющихся задач места не занимает; недоступность реестра панель
 * не ломает — индикатор просто не показывается.
 */
export function TasksIndicator() {
  const { data: tasks = [] } = useTasksQuery();
  const [open, setOpen] = useState(false);

  const running = runningTaskCount(tasks);

  if (running === 0) return null;

  return (
    <>
      <Button
        variant="outlined"
        shape="circle"
        size="sm"
        className="shrink-0 animate-fade-in"
        onClick={() => setOpen(true)}
        data-testid="topbar-tasks"
      >
        {tf("console.tasks.indicator", { count: running })}
      </Button>

      <TasksDialog open={open} tasks={tasks} onClose={() => setOpen(false)} />
    </>
  );
}
