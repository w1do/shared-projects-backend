"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  useExtractTopicsMutation,
  useGeneratePostMutation,
  useRejectTopicMutation,
  useResearchTopicsQuery,
} from "@/hooks/admin/research";
import { useTopicTasksQuery } from "@/hooks/admin/tasks";
import { lastFailedTaskOf, runningTaskOf } from "@/lib/admin/data-source/platform/task-poll";
import { taskStageLabel, taskStateLabel } from "@/lib/admin/task-labels";

type Props = {
  researchId: number;
  canExtract: boolean;
  canManageTopics: boolean;
  canGeneratePosts: boolean;
};

/** Темы исследования: извлечение, написание поста и отклонение. */
export function ResearchTopicsSection({
  researchId,
  canExtract,
  canManageTopics,
  canGeneratePosts,
}: Props) {
  const t = useConsoleText();
  const { data: topics = [] } = useResearchTopicsQuery(researchId);
  const { tasksOfTopic } = useTopicTasksQuery();
  const extract = useExtractTopicsMutation();
  const reject = useRejectTopicMutation();
  const generate = useGeneratePostMutation();

  // Выполнение видно на самой кнопке темы, а не на всём списке.
  const [busyTopicId, setBusyTopicId] = React.useState<number | null>(null);

  const run = (topicId: number, action: (id: number) => void) => {
    setBusyTopicId(topicId);
    action(topicId);
  };

  React.useEffect(() => {
    if (!generate.isPending && !reject.isPending) setBusyTopicId(null);
  }, [generate.isPending, reject.isPending]);

  return (
    <Card variant="form-section" data-testid="research-topics">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-heading font-medium leading-tight text-foreground">
            {t("console.research.topics")}
          </h2>
          <p className="text-xs text-muted-foreground-lighter">
            {t("console.research.topics-hint")}
          </p>
        </div>

        {canExtract && (
          <Button
            shape="circle"
            size="sm"
            startIcon={<Sparkles />}
            isLoading={extract.isPending}
            onClick={() => extract.mutate({ researchId })}
            data-testid="research-extract-topics"
          >
            {t("console.research.extract-topics")}
          </Button>
        )}
      </div>

      {topics.length === 0 ? (
        <p
          className="py-8 text-center text-caption text-muted-foreground-lighter"
          data-testid="research-topics-empty"
        >
          {t("console.research.topics-empty")}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {topics.map((topic) => {
            const topicTasks = tasksOfTopic(topic.id);
            const runningTask = runningTaskOf(topicTasks);
            const failedTask = runningTask ? undefined : lastFailedTaskOf(topicTasks);

            return (
              <div
                key={topic.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0"
                data-testid={`topic-row-${topic.id}`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body text-foreground">{topic.title}</p>
                  {topic.rationale && (
                    <p className="mt-2 text-caption text-muted-foreground-lighter">
                      {topic.rationale}
                    </p>
                  )}
                  <p className="mt-2 text-caption text-muted-foreground-lighter">
                    {t("console.research.topic-category")}:{" "}
                    {topic.suggested_category ?? topic.category_id ?? "—"}
                  </p>

                  {/* Ход написания поста по этой теме — рядом с самой темой. */}
                  {runningTask && (
                    <p
                      className="mt-2 text-caption text-brand-accent"
                      data-testid={`topic-task-${topic.id}`}
                    >
                      {[taskStateLabel(runningTask.state), taskStageLabel(runningTask.stage)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}

                  {failedTask && (
                    <p
                      className="mt-2 text-caption text-destructive"
                      data-testid={`topic-task-failed-${topic.id}`}
                    >
                      {failedTask.failure_reason} {t("console.tasks.failed-hint")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant={topic.status === "suggested" ? "ghost" : "soft"}
                    color={topic.status === "rejected" ? "error" : "neutral"}
                    shape="circle"
                    data-testid={`topic-status-${topic.id}`}
                  >
                    {topic.status_label}
                  </Badge>

                  {topic.status === "used" && topic.post_id != null && (
                    <Link
                      href={`/admin/blogs/${topic.post_id}/edit`}
                      className="text-caption text-foreground underline-offset-4 hover:underline"
                      data-testid={`topic-post-${topic.id}`}
                    >
                      {t("console.research.open-post")}
                    </Link>
                  )}

                  {/* Действие недоступно теме, к которой оно неприменимо. */}
                  {canGeneratePosts && (
                    <Button
                      shape="circle"
                      size="sm"
                      disabled={topic.status !== "suggested" || runningTask !== undefined}
                      isLoading={
                        runningTask !== undefined ||
                        (generate.isPending && busyTopicId === topic.id)
                      }
                      onClick={() => run(topic.id, generate.mutate)}
                      data-testid={`topic-write-${topic.id}`}
                    >
                      {t("console.research.write-post")}
                    </Button>
                  )}

                  {canManageTopics && (
                    <Button
                      variant="ghost"
                      color="error"
                      shape="circle"
                      size="sm"
                      disabled={topic.status !== "suggested"}
                      isLoading={reject.isPending && busyTopicId === topic.id}
                      onClick={() => run(topic.id, reject.mutate)}
                      data-testid={`topic-reject-${topic.id}`}
                    >
                      {t("console.research.reject-topic")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
