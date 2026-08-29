"use client";

import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Badge } from "@/components/ui/data-display/badge";
import { t } from "@/lib/admin/console-texts";
import {
  useExtractTopicsMutation,
  useGeneratePostMutation,
  useRejectTopicMutation,
  useResearchTopicsQuery,
} from "@/hooks/admin/research";

type Props = {
  researchId: number;
  canExtract: boolean;
  canManageTopics: boolean;
  canGeneratePosts: boolean;
};

/** Темы исследования: извлечение, написание поста и отклонение. */
export function ResearchTopicsPanel({
  researchId,
  canExtract,
  canManageTopics,
  canGeneratePosts,
}: Props) {
  const { data: topics = [] } = useResearchTopicsQuery(researchId);
  const extract = useExtractTopicsMutation();
  const reject = useRejectTopicMutation();
  const generate = useGeneratePostMutation();

  return (
    <div
      className="rounded-3xl bg-card p-6 shadow-subtle-3"
      data-testid="research-topics"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h4 className="text-body text-foreground">
          {t("console.research.topics")}
        </h4>

        {canExtract && (
          <Button
            onClick={() => extract.mutate({ researchId })}
            disabled={extract.isPending}
            data-testid="research-extract-topics"
          >
            {extract.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {t("console.research.extract-topics")}
          </Button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/40 p-4"
            data-testid={`topic-row-${topic.id}`}
          >
            <div className="min-w-0">
              <p className="truncate text-body text-foreground">
                {topic.title}
              </p>
              {topic.rationale && (
                <p className="mt-1 text-caption text-muted-foreground-lighter">
                  {topic.rationale}
                </p>
              )}
              <p className="mt-1 text-caption text-muted-foreground-lighter">
                {t("console.research.topic-category")}:{" "}
                {topic.suggested_category ?? topic.category_id ?? "—"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={topic.status === "suggested" ? "outline" : "secondary"}
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

              {topic.status === "suggested" && canGeneratePosts && (
                <Button
                  size="sm"
                  onClick={() => generate.mutate(topic.id)}
                  disabled={generate.isPending}
                  data-testid={`topic-write-${topic.id}`}
                >
                  {t("console.research.write-post")}
                </Button>
              )}

              {topic.status === "suggested" && canManageTopics && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => reject.mutate(topic.id)}
                  data-testid={`topic-reject-${topic.id}`}
                >
                  {t("console.research.reject-topic")}
                </Button>
              )}
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <p
            className="py-8 text-center text-caption text-muted-foreground-lighter"
            data-testid="research-topics-empty"
          >
            {t("console.research.topics-empty")}
          </p>
        )}
      </div>
    </div>
  );
}
