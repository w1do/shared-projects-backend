"use client";

import * as React from "react";
import { Loader2, Search, Telescope } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  useCancelResearchMutation,
  useResearchListQuery,
  useStartResearchMutation,
} from "@/hooks/admin/research";
import { ResearchListSkeleton } from "@/components/pages/research/loading/ResearchListSkeleton";

const STATUS_VALUES = ["", "process", "done", "failed", "canceled"] as const;

type Props = {
  canRun: boolean;
  onOpen: (id: number) => void;
};

/** Список исследований проекта: запуск, отбор по состоянию, отмена. */
export function ResearchListSection({ canRun, onOpen }: Props) {
  const t = useConsoleText();
  const [status, setStatus] = React.useState<string>("");
  const [query, setQuery] = React.useState("");

  const { data: researches = [], isPending } = useResearchListQuery(status || undefined);
  const start = useStartResearchMutation();
  const cancel = useCancelResearchMutation();

  const statusOptions = STATUS_VALUES.map((value) => ({
    value,
    label: value === "" ? t("console.research.filter-all") : t(`console.research.status.${value}`),
  }));

  if (isPending) return <ResearchListSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      {canRun && (
        <Card variant="form-section" data-testid="research-form">
          <div className="flex flex-col gap-2">
            <h2 className="text-heading font-medium leading-tight text-foreground">
              {t("console.research.new")}
            </h2>
            <p className="text-xs text-muted-foreground-lighter">
              {t("console.research.new-subtitle")}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <Input
              label={t("console.research.query")}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("console.research.query-placeholder")}
              className="min-w-0 flex-1"
              data-testid="research-query-input"
            />
            <Button
              shape="circle"
              startIcon={start.isPending ? <Loader2 className="animate-spin" /> : <Search />}
              isLoading={start.isPending}
              disabled={query.trim().length < 3}
              onClick={() => start.mutate({ query }, { onSuccess: () => setQuery("") })}
              data-testid="research-start"
            >
              {t("console.research.start")}
            </Button>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          options={statusOptions}
          className="w-48"
          placeholder={t("console.research.status")}
          data-testid="research-status-filter"
        />
      </div>

      {researches.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-3xl bg-muted p-12 text-center"
          data-testid="research-empty"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-background shadow-subtle-3">
            <Telescope className="size-6 text-ring" />
          </div>
          <p className="font-openrunde text-heading text-foreground">
            {t("console.research.empty")}
          </p>
          <p className="max-w-sm text-body text-muted-foreground">
            {t("console.research.empty-hint")}
          </p>
        </div>
      ) : (
        <Card variant="form-section" data-testid="research-list">
          {researches.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0"
              data-testid={`research-row-${item.id}`}
            >
              <Button
                variant="ghost"
                colors="surface"
                size="auto"
                shape="rectangle"
                className="min-w-0 flex-1 justify-start p-0 text-left hover:bg-transparent"
                onClick={() => onOpen(item.id)}
              >
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-body text-foreground">{item.query}</span>
                  <span className="mt-2 text-caption text-muted-foreground-lighter">
                    {t("console.research.sources")}: {item.sources_count} ·{" "}
                    {t("console.research.topics")}: {item.topics_count}
                  </span>
                </span>
              </Button>

              <div className="flex items-center gap-2">
                <Badge
                  variant={item.status === "done" ? "soft" : "ghost"}
                  color={item.status === "failed" ? "error" : "neutral"}
                  shape="circle"
                  data-testid={`research-status-${item.id}`}
                >
                  {item.status === "process"
                    ? `${item.status_label} · ${item.progress_stage_label}`
                    : item.status_label}
                </Badge>

                {canRun && item.status === "process" && (
                  <Button
                    variant="ghost"
                    color="error"
                    shape="circle"
                    size="sm"
                    isLoading={cancel.isPending}
                    onClick={() => cancel.mutate(item.id)}
                    data-testid={`research-cancel-${item.id}`}
                  >
                    {t("console.research.cancel")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
