"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { t } from "@/lib/admin/console-texts";
import {
  useProjectBuildoutQuery,
  useStartProjectBuildoutMutation,
} from "@/hooks/admin/project";

type Props = {
  /** Тематика проекта — заготовка поля запуска. */
  initialTopic: string;
  /** Описание проекта не заполнено: сборка по AI его и заполняет. */
  descriptionEmpty: boolean;
};

/**
 * Сборка проекта по AI: запрос тематики, ход и результат.
 *
 * Пока сборка идёт, повторный запуск недоступен: вторую сборку платформа
 * всё равно отклонит.
 */
export function BuildoutPanel({ initialTopic, descriptionEmpty }: Props) {
  const { data: buildout } = useProjectBuildoutQuery();
  const startBuildout = useStartProjectBuildoutMutation();
  const [topic, setTopic] = React.useState(initialTopic);

  React.useEffect(() => setTopic(initialTopic), [initialTopic]);

  const running = buildout?.status === "process";

  return (
    <div data-testid="project-card-buildout">
      {descriptionEmpty && (
        <p
          className="mb-4 text-caption text-muted-foreground-lighter"
          data-testid="project-description-empty"
        >
          {t("console.project.description-empty")}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder={t("console.project.build-topic-placeholder")}
          className="max-w-xs"
          disabled={running}
          data-testid="project-card-build-topic"
        />
        <Button
          type="button"
          onClick={() => startBuildout.mutate({ topic })}
          disabled={
            running || startBuildout.isPending || topic.trim().length < 2
          }
          data-testid="project-card-build"
        >
          {running ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {running
            ? t("console.project.build-running")
            : t("console.project.build")}
        </Button>
      </div>

      {buildout?.status === "done" && (
        <p
          className="mt-4 text-caption text-muted-foreground"
          data-testid="project-card-build-done"
        >
          {t("console.project.build-done")} ·{" "}
          {t("console.project.build-categories")}: {buildout.categories_created}
        </p>
      )}

      {buildout?.status === "failed" && (
        <p
          className="mt-4 text-caption text-destructive"
          data-testid="project-card-build-failed"
        >
          {t("console.project.build-failed")}
          {buildout.error_message ? `: ${buildout.error_message}` : ""}
        </p>
      )}
    </div>
  );
}
