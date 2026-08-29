"use client";

import * as React from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Badge } from "@/components/ui/data-display/badge";
import { t } from "@/lib/admin/console-texts";
import {
  useCancelResearchMutation,
  useResearchQuery,
} from "@/hooks/admin/research";

import { ResearchTopicsPanel } from "./ResearchTopicsPanel";

type Props = {
  researchId: number;
  canRun: boolean;
  canManageTopics: boolean;
  canGeneratePosts: boolean;
  onBack: () => void;
};

/** Карточка исследования: подзапросы, источники, сводный текст и темы. */
export function ResearchDetailSection({
  researchId,
  canRun,
  canManageTopics,
  canGeneratePosts,
  onBack,
}: Props) {
  const { data: research } = useResearchQuery(researchId);
  const cancel = useCancelResearchMutation();

  if (!research) return null;

  return (
    <div className="flex flex-col gap-6" data-testid="research-detail">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" onClick={onBack} data-testid="research-back">
          <ArrowLeft className="size-4" />
          {t("console.research.back")}
        </Button>

        <div className="flex items-center gap-2">
          <Badge variant="outline" data-testid="research-detail-status">
            {research.status === "process"
              ? `${research.status_label} · ${research.progress_stage_label}`
              : research.status_label}
          </Badge>

          {canRun && research.status === "process" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => cancel.mutate(research.id)}
            >
              {t("console.research.cancel")}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
        <h3 className="font-openrunde text-heading text-foreground">
          {research.query}
        </h3>

        {research.error_message && (
          <p
            className="mt-2 text-caption text-destructive"
            data-testid="research-detail-error"
          >
            {research.error_message}
          </p>
        )}

        {research.sub_queries.length > 0 && (
          <div
            className="mt-4 flex flex-wrap gap-2"
            data-testid="research-sub-queries"
          >
            {research.sub_queries.map((subQuery) => (
              <Badge key={subQuery} variant="secondary">
                {subQuery}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
        <h4 className="text-body text-foreground">
          {t("console.research.sources")}
        </h4>

        <ul className="mt-4 flex flex-col gap-2" data-testid="research-sources">
          {research.sources.map((source) => (
            <li key={source.id} className="flex items-center gap-2">
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="truncate text-caption text-foreground underline-offset-4 hover:underline"
              >
                {source.title ?? source.url}
              </a>
              <ExternalLink className="size-4 shrink-0 text-muted-foreground-lighter" />
            </li>
          ))}
        </ul>
      </div>

      {research.summary && (
        <div className="rounded-3xl bg-card p-6 shadow-subtle-3">
          <h4 className="text-body text-foreground">
            {t("console.research.summary")}
          </h4>
          <p
            className="mt-4 whitespace-pre-line text-caption text-muted-foreground"
            data-testid="research-summary"
          >
            {research.summary}
          </p>
        </div>
      )}

      <ResearchTopicsPanel
        researchId={researchId}
        canExtract={canManageTopics && research.status === "done"}
        canManageTopics={canManageTopics}
        canGeneratePosts={canGeneratePosts}
      />
    </div>
  );
}
