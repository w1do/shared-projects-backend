"use client";

import { Badge } from "@/components/ui/data-display/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/overlay/dialog";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  taskKindLabel,
  taskStageLabel,
  taskStateLabel,
  taskSubjectLabel,
} from "@/lib/admin/task-labels";
import type { PlatformTask } from "@/lib/admin/services";

type Props = {
  open: boolean;
  tasks: PlatformTask[];
  onClose: () => void;
};

const STATE_COLOR = {
  queued: "secondary",
  running: "primary",
  succeeded: "success",
  failed: "error",
} as const;

/** Список фоновых задач проекта: вид работы, предмет, этап и состояние. */
export function TasksDialog({ open, tasks, onClose }: Props) {
  const t = useConsoleText();

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent size="md" radius="3xl" scroll data-testid="tasks-dialog">
        <DialogTitle className="text-heading-lg font-semibold">
          {t("console.tasks.title")}
        </DialogTitle>
        <DialogDescription className="mt-1 text-xs text-muted-foreground">
          {t("console.tasks.subtitle")}
        </DialogDescription>

        {tasks.length === 0 ? (
          <p className="mt-6 text-xs text-muted-foreground">
            {t("console.tasks.empty")}
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-2">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-4"
                data-testid="tasks-dialog-item"
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="truncate text-xs font-medium text-foreground">
                    {taskKindLabel(task.kind)}
                  </span>
                  <span className="truncate text-caption text-muted-foreground">
                    {[taskSubjectLabel(task), taskStageLabel(task.stage)]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {task.failure_reason && (
                    <span className="text-caption text-destructive">
                      {task.failure_reason}
                    </span>
                  )}
                </div>

                <Badge
                  variant="soft"
                  shape="circle"
                  color={STATE_COLOR[task.state]}
                >
                  {taskStateLabel(task.state)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
