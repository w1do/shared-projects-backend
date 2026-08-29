"use client";

import * as React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { t } from "@/lib/admin/console-texts";
import {
  formatSchemaJson,
  parseSchemaJson,
} from "@/lib/admin/instructs/schema-json";
import type { PlatformInstruct } from "@/lib/admin/services";
import {
  useInstructCategoriesQuery,
  useSaveInstructMutation,
} from "@/hooks/admin/instructs";

import { SystemInstructNotice } from "./SystemInstructNotice";

type Props = {
  instruct: PlatformInstruct | null;
  canManage: boolean;
  onClose: () => void;
};

/**
 * Создание и правка инструкции. Предустановленная открывается только на
 * чтение: её можно взять за основу своей, но не изменить.
 */
export function InstructFormSection({ instruct, canManage, onClose }: Props) {
  const { data: categories = [] } = useInstructCategoriesQuery();
  const save = useSaveInstructMutation();

  const readOnly = instruct?.is_system === true || !canManage;

  const [title, setTitle] = React.useState(instruct?.title ?? "");
  const [category, setCategory] = React.useState(instruct?.category ?? "");
  const [rule, setRule] = React.useState(instruct?.rule ?? "");
  const [schema, setSchema] = React.useState(
    formatSchemaJson(instruct?.schema),
  );
  const [published, setPublished] = React.useState(
    instruct?.published ?? false,
  );
  const [schemaError, setSchemaError] = React.useState<string | null>(null);
  const [basedOnSystem, setBasedOnSystem] = React.useState(false);

  React.useEffect(() => {
    if (categories.length > 0 && category === "") {
      setCategory(categories[0].value);
    }
  }, [categories, category]);

  const editable = !readOnly || basedOnSystem;

  const submit = () => {
    const parsed = parseSchemaJson(schema);

    if (!parsed.ok) {
      setSchemaError(t("console.instructs.schema-invalid"));
      return;
    }

    setSchemaError(null);
    save.mutate(
      {
        // Своя инструкция на основе предустановленной создаётся как новая
        id: basedOnSystem ? undefined : instruct?.id,
        body: { title, category, rule, schema: parsed.value, published },
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="flex flex-col gap-6" data-testid="instruct-form">
      <Button
        variant="ghost"
        onClick={onClose}
        className="w-fit"
        data-testid="instruct-back"
      >
        <ArrowLeft className="size-4" />
        {t("console.instructs.cancel")}
      </Button>

      {readOnly && !basedOnSystem && (
        <SystemInstructNotice
          canManage={canManage}
          onDuplicate={() => setBasedOnSystem(true)}
        />
      )}

      <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-subtle-3">
        <label className="flex flex-col gap-2">
          <span className="text-caption text-muted-foreground">
            {t("console.instructs.name")}
          </span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={!editable}
            data-testid="instruct-title-input"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption text-muted-foreground">
            {t("console.instructs.category")}
          </span>
          <select
            className="h-10 rounded-xl border border-border bg-background px-4 text-body text-foreground"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            disabled={!editable}
            data-testid="instruct-category-select"
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption text-muted-foreground">
            {t("console.instructs.rule")}
          </span>
          <Textarea
            value={rule}
            onChange={(event) => setRule(event.target.value)}
            rows={6}
            disabled={!editable}
            data-testid="instruct-rule-input"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-caption text-muted-foreground">
            {t("console.instructs.schema")}
          </span>
          <Textarea
            value={schema}
            onChange={(event) => {
              setSchema(event.target.value);
              setSchemaError(null);
            }}
            rows={14}
            className="font-mono text-xs"
            disabled={!editable}
            data-testid="instruct-schema-input"
          />
          {schemaError && (
            <span
              className="text-caption text-destructive"
              data-testid="instruct-schema-error"
            >
              {schemaError}
            </span>
          )}
        </label>

        {editable && (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              data-testid="instruct-published-input"
            />
            <span className="text-caption text-muted-foreground">
              {t("console.instructs.published")}
            </span>
          </label>
        )}

        {editable && (
          <div className="flex gap-2">
            <Button
              onClick={submit}
              disabled={save.isPending}
              data-testid="instruct-save"
            >
              {t("console.instructs.save")}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t("console.instructs.cancel")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
