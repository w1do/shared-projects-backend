"use client";

import * as React from "react";
import { FileText, Plus } from "lucide-react";
import { Badge } from "@/components/ui/data-display/badge";
import { Card } from "@/components/ui/data-display/card";
import { Skeleton } from "@/components/ui/data-display/skeleton";
import { Button } from "@/components/ui/inputs/button";
import { Select } from "@/components/ui/inputs/select";
import { useConsoleText } from "@/lib/admin/use-console-text";
import type { PlatformInstruct } from "@/lib/admin/services";
import {
  useDeleteInstructMutation,
  useInstructCategoriesQuery,
  useInstructsQuery,
} from "@/hooks/admin/instructs";
import { InstructDeleteDialog } from "@/components/pages/instructs/sections/instruct-list/InstructDeleteDialog";

type Props = {
  canManage: boolean;
  onCreate: () => void;
  onEdit: (instruct: PlatformInstruct) => void;
};

/** Список инструкций проекта и предустановленных платформы. */
export function InstructListSection({ canManage, onCreate, onEdit }: Props) {
  const t = useConsoleText();
  const [category, setCategory] = React.useState("");
  const [pendingDelete, setPendingDelete] = React.useState<PlatformInstruct | null>(null);

  const { data: categories = [] } = useInstructCategoriesQuery();
  const { data: instructs = [], isPending } = useInstructsQuery(category || undefined);
  const remove = useDeleteInstructMutation();

  const categoryOptions = [
    { value: "", label: t("console.instructs.filter-all") },
    ...categories.map((item) => ({ value: item.value, label: item.label })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          options={categoryOptions}
          className="w-64"
          placeholder={t("console.instructs.category")}
          data-testid="instructs-category-filter"
        />

        {canManage && (
          <Button
            shape="circle"
            startIcon={<Plus />}
            onClick={onCreate}
            data-testid="instructs-create"
          >
            {t("console.instructs.new")}
          </Button>
        )}
      </div>

      {isPending ? (
        <Card variant="form-section" data-testid="instructs-skeleton">
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          ))}
        </Card>
      ) : instructs.length === 0 ? (
        <div
          className="flex flex-col items-center gap-4 rounded-3xl bg-muted p-12 text-center"
          data-testid="instructs-empty"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-background shadow-subtle-3">
            <FileText className="size-6 text-ring" />
          </div>
          <p className="font-openrunde text-heading text-foreground">
            {t("console.instructs.empty")}
          </p>
          {canManage && (
            <Button variant="contained" color="surface" shape="circle" onClick={onCreate}>
              {t("console.instructs.new")}
            </Button>
          )}
        </div>
      ) : (
        <Card variant="form-section" data-testid="instructs-list">
          {instructs.map((instruct) => (
            <div
              key={instruct.id}
              className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4 last:border-0 last:pb-0"
              data-testid={`instruct-row-${instruct.id}`}
            >
              <Button
                variant="ghost"
                colors="surface"
                size="auto"
                shape="rectangle"
                className="min-w-0 flex-1 justify-start p-0 text-left hover:bg-transparent"
                onClick={() => onEdit(instruct)}
              >
                <span className="min-w-0 truncate text-body text-foreground">{instruct.title}</span>
              </Button>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="ghost" color="neutral" shape="circle">
                  {instruct.category_label}
                </Badge>
                <Badge
                  variant="soft"
                  color={instruct.is_system ? "info" : "neutral"}
                  shape="circle"
                >
                  {instruct.is_system
                    ? t("console.instructs.system")
                    : t("console.instructs.own")}
                </Badge>
                {instruct.published && (
                  <Badge
                    variant="soft"
                    color="success"
                    shape="circle"
                    data-testid={`instruct-applied-${instruct.id}`}
                  >
                    {t("console.instructs.applied")}
                  </Badge>
                )}

                {canManage && !instruct.is_system && (
                  <Button
                    variant="ghost"
                    color="error"
                    shape="circle"
                    size="sm"
                    onClick={() => setPendingDelete(instruct)}
                    data-testid={`instruct-delete-${instruct.id}`}
                  >
                    {t("console.instructs.delete")}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </Card>
      )}

      <InstructDeleteDialog
        instruct={pendingDelete}
        isBusy={remove.isPending}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          remove.mutate(pendingDelete.id, { onSuccess: () => setPendingDelete(null) });
        }}
      />
    </div>
  );
}
