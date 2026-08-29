"use client";

import { ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { useCancelResearchMutation, useResearchQuery } from "@/hooks/admin/research";
import { ResearchTopicsSection } from "@/components/pages/research/sections/research-topics";

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
  const t = useConsoleText();
  const { data: research } = useResearchQuery(researchId);
  const cancel = useCancelResearchMutation();

  if (!research) return null;

  return (
    <div className="flex flex-col gap-6" data-testid="research-detail">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="ghost"
          shape="circle"
          size="sm"
          startIcon={<ArrowLeft />}
          onClick={onBack}
          data-testid="research-back"
        >
          {t("console.research.back")}
        </Button>

        <div className="flex items-center gap-2">
          <Badge
            variant="soft"
            color={research.status === "failed" ? "error" : "neutral"}
            shape="circle"
            data-testid="research-detail-status"
          >
            {research.status === "process"
              ? `${research.status_label} · ${research.progress_stage_label}`
              : research.status_label}
          </Badge>

          {canRun && research.status === "process" && (
            <Button
              variant="ghost"
              color="error"
              shape="circle"
              size="sm"
              isLoading={cancel.isPending}
              onClick={() => cancel.mutate(research.id)}
            >
              {t("console.research.cancel")}
            </Button>
          )}
        </div>
      </div>

      <Card variant="form-section">
        <div className="flex flex-col gap-2">
          <h2 className="text-heading font-medium leading-tight text-foreground">
            {research.query}
          </h2>
          {research.error_message && (
            <p className="text-xs font-medium text-destructive" data-testid="research-detail-error">
              {research.error_message}
            </p>
          )}
        </div>

        {research.sub_queries.length > 0 && (
          <div className="flex flex-wrap gap-2" data-testid="research-sub-queries">
            {research.sub_queries.map((subQuery) => (
              <Badge key={subQuery} variant="soft" color="neutral" shape="circle">
                {subQuery}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <Card variant="form-section">
        <div className="flex flex-col gap-2">
          <h2 className="text-heading font-medium leading-tight text-foreground">
            {t("console.research.sources")}
          </h2>
          <p className="text-xs text-muted-foreground-lighter">
            {t("console.research.sources-hint")}
          </p>
        </div>

        <ul className="flex flex-col gap-2" data-testid="research-sources">
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
      </Card>

      {research.summary && (
        <Card variant="form-section">
          <h2 className="text-heading font-medium leading-tight text-foreground">
            {t("console.research.summary")}
          </h2>
          <p
            className="whitespace-pre-line text-caption text-muted-foreground"
            data-testid="research-summary"
          >
            {research.summary}
          </p>
        </Card>
      )}

      <ResearchTopicsSection
        researchId={researchId}
        canExtract={canManageTopics && research.status === "done"}
        canManageTopics={canManageTopics}
        canGeneratePosts={canGeneratePosts}
      />
    </div>
  );
}
