"use client";

import * as React from "react";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/overlay/alert-dialog";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { usePostRebuild } from "@/hooks/admin/articles";
import { taskStageLabel, taskStateLabel } from "@/lib/admin/task-labels";

/** Пересборка поста через AI: запуск с подтверждением и ход задачи (режим api). */
export function PostRebuildCard({ articleId }: { articleId: string }) {
  const t = useConsoleText();
  const { start, isStarting, runningTask, failedTask } = usePostRebuild(articleId);

  return (
    <Card variant="form-section" data-testid="post-rebuild">
      <h2 className="text-sm font-semibold text-foreground leading-tight">
        {t("console.blogs.rebuild.title")}
      </h2>
      <p className="text-caption text-muted-foreground-lighter">
        {t("console.blogs.rebuild.description")}
      </p>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="outlined"
            shape="circle"
            size="sm"
            fullWidth
            disabled={isStarting || runningTask !== undefined}
          >
            {t("console.blogs.rebuild.action")}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("console.blogs.rebuild.confirm-title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("console.blogs.rebuild.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("console.blogs.rebuild.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={start}>
              {t("console.blogs.rebuild.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {runningTask && (
        <p className="text-caption text-brand-accent" data-testid="post-rebuild-task">
          {[taskStateLabel(runningTask.state), taskStageLabel(runningTask.stage)]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}

      {failedTask && (
        <p className="text-caption text-destructive" data-testid="post-rebuild-failed">
          {failedTask.failure_reason} {t("console.tasks.failed-hint")}
        </p>
      )}
    </Card>
  );
}
