"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Badge } from "@/components/ui/data-display/badge";
import { t } from "@/lib/admin/console-texts";
import {
  useCancelResearchMutation,
  useResearchListQuery,
  useStartResearchMutation,
} from "@/hooks/admin/research";

const STATUS_FILTERS = ["", "process", "done", "failed", "canceled"] as const;

type Props = {
  canRun: boolean;
  onOpen: (id: number) => void;
};

/** Список исследований проекта: запуск, отбор по состоянию, отмена. */
export function ResearchListSection({ canRun, onOpen }: Props) {
  const [status, setStatus] = React.useState<string>("");
  const [query, setQuery] = React.useState("");

  const { data: researches = [], isPending } = useResearchListQuery(
    status || undefined,
  );
  const start = useStartResearchMutation();
  const cancel = useCancelResearchMutation();

  return (
    <div className="flex flex-col gap-6">
      {canRun && (
        <div
          className="rounded-3xl bg-card p-6 shadow-subtle-3"
          data-testid="research-form"
        >
          <h3 className="font-openrunde text-heading text-foreground">
            {t("console.research.new")}
          </h3>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("console.research.query-placeholder")}
              className="max-w-xl"
              data-testid="research-query-input"
            />
            <Button
              onClick={() =>
                start.mutate({ query }, { onSuccess: () => setQuery("") })
              }
              disabled={start.isPending || query.trim().length < 3}
              data-testid="research-start"
            >
              {start.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              {t("console.research.start")}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2" data-testid="research-filters">
        {STATUS_FILTERS.map((value) => (
          <Button
            key={value || "all"}
            variant={status === value ? "contained" : "outlined"}
            size="sm"
            onClick={() => setStatus(value)}
            data-testid={`research-filter-${value || "all"}`}
          >
            {value === "" ? t("console.research.filter-all") : value}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-4" data-testid="research-list">
        {researches.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-subtle-3"
            data-testid={`research-row-${item.id}`}
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onOpen(item.id)}
            >
              <p className="truncate text-body text-foreground">{item.query}</p>
              <p className="mt-1 text-caption text-muted-foreground-lighter">
                {t("console.research.sources")}: {item.sources_count} ·{" "}
                {t("console.research.topics")}: {item.topics_count}
              </p>
            </button>

            <div className="flex items-center gap-2">
              <Badge
                variant={item.status === "done" ? "secondary" : "outline"}
                data-testid={`research-status-${item.id}`}
              >
                {item.status === "process"
                  ? `${item.status_label} · ${item.progress_stage_label}`
                  : item.status_label}
              </Badge>

              {canRun && item.status === "process" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => cancel.mutate(item.id)}
                  data-testid={`research-cancel-${item.id}`}
                >
                  {t("console.research.cancel")}
                </Button>
              )}
            </div>
          </div>
        ))}

        {!isPending && researches.length === 0 && (
          <p
            className="py-8 text-center text-caption text-muted-foreground-lighter"
            data-testid="research-empty"
          >
            {t("console.research.empty")}
          </p>
        )}
      </div>
    </div>
  );
}
