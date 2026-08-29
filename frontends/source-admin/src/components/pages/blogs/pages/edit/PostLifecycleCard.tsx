"use client";

import * as React from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/data-display/card";
import { Badge } from "@/components/ui/data-display/badge";
import { Button } from "@/components/ui/inputs/button";
import type { Article } from "@/lib/admin/types/magazine";
import { tf, type ConsoleTextKey } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  useArticleRevisionsQuery,
  useChangeArticleStatusMutation,
  useRestoreArticleRevisionMutation,
} from "@/hooks/admin/articles";
import { articleStatusLabel, formatArticleDate } from "@/components/pages/blogs/utils";

/**
 * Статус и история поста (режим api).
 *
 * Набор действий строится по текущему статусу, но допустимость перехода решает
 * статус-машина платформы: отказ показывается как ошибка и статус не меняется.
 * Подписи кнопок — ключи реестра текстов, перевод происходит в точке показа.
 */
const ACTIONS: Record<string, Array<{ labelKey: ConsoleTextKey; status: string }>> = {
  draft: [{ labelKey: "console.blogs.lifecycle.publish", status: "published" }],
  scheduled: [
    { labelKey: "console.blogs.lifecycle.publish", status: "published" },
    { labelKey: "console.blogs.lifecycle.to-draft", status: "draft" },
  ],
  published: [{ labelKey: "console.blogs.lifecycle.archive", status: "archived" }],
  archived: [{ labelKey: "console.blogs.lifecycle.to-draft", status: "draft" }],
};

const STATUS_COLOR: Record<string, "success" | "warning" | "neutral"> = {
  published: "success",
  draft: "warning",
  scheduled: "warning",
  archived: "neutral",
};

export function PostLifecycleCard({ article }: { article: Article }) {
  const t = useConsoleText();
  const status = article.status;
  const changeStatus = useChangeArticleStatusMutation();
  const restore = useRestoreArticleRevisionMutation();
  const { data: revisions = [] } = useArticleRevisionsQuery(article.id);

  if (!status) return null; // демо-данные вёрстки статуса не несут

  const apply = (next: string, label: string) =>
    changeStatus.mutate(
      { id: article.id, status: next },
      {
        onSuccess: () =>
          toast.success(
            tf("console.blogs.lifecycle.status-changed", { status: articleStatusLabel(next) }),
          ),
        onError: (error: Error) =>
          toast.error(
            error.message || tf("console.blogs.lifecycle.action-failed", { action: label }),
          ),
      },
    );

  return (
    <Card variant="form-section" data-testid="post-lifecycle">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground leading-tight">
          {t("console.blogs.lifecycle.title")}
        </h2>
        <Badge
          color={STATUS_COLOR[status] ?? "neutral"}
          variant="soft"
          shape="circle"
          data-testid="post-status"
        >
          {articleStatusLabel(status)}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        {(ACTIONS[status] ?? []).map((action) => (
          <Button
            key={action.status}
            type="button"
            variant="outlined"
            shape="circle"
            size="sm"
            fullWidth
            disabled={changeStatus.isPending}
            onClick={() => apply(action.status, t(action.labelKey))}
          >
            {t(action.labelKey)}
          </Button>
        ))}
      </div>

      {revisions.length > 0 && (
        <div className="flex flex-col gap-2" data-testid="post-revisions">
          <span className="text-xs font-medium text-muted-foreground block">
            {t("console.blogs.lifecycle.revisions")}
          </span>
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto">
            {revisions.map((revision) => (
              <div key={revision.id} className="flex items-center justify-between gap-2">
                <span className="text-caption text-muted-foreground-lighter">
                  #{revision.id}
                  {revision.createdAt ? ` · ${formatArticleDate(revision.createdAt)}` : ""}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={restore.isPending}
                  onClick={() =>
                    restore.mutate(
                      { id: article.id, revisionId: revision.id },
                      {
                        onSuccess: () =>
                          toast.success(
                            tf("console.blogs.lifecycle.revision-restored", { id: revision.id }),
                          ),
                        onError: (error: Error) =>
                          toast.error(
                            error.message || t("console.blogs.lifecycle.restore-failed"),
                          ),
                      },
                    )
                  }
                >
                  {t("console.blogs.lifecycle.restore")}
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
