"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Badge } from "@/components/ui/data-display/badge";
import { t } from "@/lib/admin/console-texts";
import { useConsoleAccessQuery } from "@/hooks/admin/project";
import {
  useGeneratePostMutation,
  useTopicsQuery,
} from "@/hooks/admin/research";

/**
 * Выбор темы при создании поста: предложенные темы ресёрча и запуск генерации.
 *
 * Пока генерация идёт, список тем перечитывается: как только тема становится
 * использованной, оператор переходит в созданный черновик.
 */
export function TopicPicker() {
  const router = useRouter();
  const { data: access } = useConsoleAccessQuery();
  const generate = useGeneratePostMutation();
  const [pending, setPending] = React.useState<number | null>(null);

  const { data: topics = [] } = useTopicsQuery("suggested");
  const { data: used = [] } = useTopicsQuery("used");

  // Тема, по которой запущена генерация, перешла в «использована» — открываем пост.
  React.useEffect(() => {
    if (pending === null) return;

    const done = used.find(
      (topic) => topic.id === pending && topic.post_id != null,
    );
    if (done?.post_id != null) {
      setPending(null);
      router.push(`/admin/blogs/${done.post_id}/edit`);
    }
  }, [pending, used, router]);

  if (!(access?.canGeneratePosts ?? false) || topics.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-3xl bg-card p-6 shadow-subtle-3"
      data-testid="topic-picker"
    >
      <h3 className="font-openrunde text-heading text-foreground">
        {t("console.research.topics")}
      </h3>

      <div className="mt-4 flex flex-col gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/40 p-4"
            data-testid={`topic-picker-row-${topic.id}`}
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
            </div>

            <div className="flex items-center gap-2">
              {topic.suggested_category && (
                <Badge variant="outline">{topic.suggested_category}</Badge>
              )}

              <Button
                size="sm"
                onClick={() => {
                  setPending(topic.id);
                  generate.mutate(topic.id);
                }}
                disabled={pending !== null}
                data-testid={`topic-picker-write-${topic.id}`}
              >
                {pending === topic.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {t("console.research.write-post")}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
