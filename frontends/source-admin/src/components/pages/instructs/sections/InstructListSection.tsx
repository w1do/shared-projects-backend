"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Badge } from "@/components/ui/data-display/badge";
import { t } from "@/lib/admin/console-texts";
import type { PlatformInstruct } from "@/lib/admin/services";
import {
  useDeleteInstructMutation,
  useInstructCategoriesQuery,
  useInstructsQuery,
} from "@/hooks/admin/instructs";

type Props = {
  canManage: boolean;
  onCreate: () => void;
  onEdit: (instruct: PlatformInstruct) => void;
};

/** Список инструкций проекта и предустановленных платформы. */
export function InstructListSection({ canManage, onCreate, onEdit }: Props) {
  const [category, setCategory] = React.useState("");
  const { data: categories = [] } = useInstructCategoriesQuery();
  const { data: instructs = [], isPending } = useInstructsQuery(
    category || undefined,
  );
  const remove = useDeleteInstructMutation();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" data-testid="instructs-filters">
          <Button
            variant={category === "" ? "contained" : "outlined"}
            size="sm"
            onClick={() => setCategory("")}
          >
            {t("console.instructs.filter-all")}
          </Button>
          {categories.map((item) => (
            <Button
              key={item.value}
              variant={category === item.value ? "contained" : "outlined"}
              size="sm"
              onClick={() => setCategory(item.value)}
              data-testid={`instructs-filter-${item.value}`}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {canManage && (
          <Button onClick={onCreate} data-testid="instructs-create">
            <Plus className="size-4" />
            {t("console.instructs.new")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-4" data-testid="instructs-list">
        {instructs.map((instruct) => (
          <div
            key={instruct.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-4 shadow-subtle-3"
            data-testid={`instruct-row-${instruct.id}`}
          >
            <button
              type="button"
              className="min-w-0 flex-1 text-left"
              onClick={() => onEdit(instruct)}
            >
              <p className="truncate text-body text-foreground">
                {instruct.title}
              </p>
              <p className="mt-1 text-caption text-muted-foreground-lighter">
                {instruct.category_label}
              </p>
            </button>

            <div className="flex items-center gap-2">
              <Badge variant={instruct.is_system ? "outline" : "secondary"}>
                {instruct.is_system
                  ? t("console.instructs.system")
                  : t("console.instructs.own")}
              </Badge>

              {instruct.published && (
                <Badge
                  variant="secondary"
                  data-testid={`instruct-applied-${instruct.id}`}
                >
                  {t("console.instructs.applied")}
                </Badge>
              )}

              {canManage && !instruct.is_system && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove.mutate(instruct.id)}
                  data-testid={`instruct-delete-${instruct.id}`}
                >
                  {t("console.instructs.delete")}
                </Button>
              )}
            </div>
          </div>
        ))}

        {!isPending && instructs.length === 0 && (
          <p
            className="py-8 text-center text-caption text-muted-foreground-lighter"
            data-testid="instructs-empty"
          >
            {t("console.instructs.empty")}
          </p>
        )}
      </div>
    </div>
  );
}
