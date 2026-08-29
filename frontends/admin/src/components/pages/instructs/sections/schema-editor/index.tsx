"use client";

import * as React from "react";
import { Braces, ListTree, Plus } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { ButtonGroup } from "@/components/ui/inputs/button-group";
import { Select } from "@/components/ui/inputs/select";
import { Textarea } from "@/components/ui/inputs/textarea";
import { useConsoleText } from "@/lib/admin/use-console-text";
import {
  emptySchemaField,
  fieldsToJsonSchema,
  type SchemaField,
} from "@/lib/admin/instructs/schema-fields";
import { formatSchemaJson } from "@/lib/admin/instructs/schema-json";
import { SchemaFieldRow } from "./SchemaFieldRow";

export type SchemaEditorMode = "fields" | "json";

type Props = {
  mode: SchemaEditorMode;
  onModeChange: (mode: SchemaEditorMode) => void;
  fields: SchemaField[];
  onFieldsChange: (fields: SchemaField[]) => void;
  json: string;
  onJsonChange: (json: string) => void;
  /** Схема сложнее редактора: режим полей недоступен. */
  fieldsDisabled?: boolean;
  disabled?: boolean;
  error?: string | null;
  presetOptions: { value: string; label: string }[];
  presetValue: string;
  onPresetChange: (key: string) => void;
};

/**
 * Схема ответа: список полей и запасной JSON-режим.
 *
 * Переключение режимов идёт через одно представление — поля переводятся в JSON
 * при уходе из режима полей, поэтому заданное оператором не теряется.
 */
export function SchemaEditor({
  mode,
  onModeChange,
  fields,
  onFieldsChange,
  json,
  onJsonChange,
  fieldsDisabled = false,
  disabled = false,
  error,
  presetOptions,
  presetValue,
  onPresetChange,
}: Props) {
  const t = useConsoleText();

  const modeOptions = [
    { value: "fields" as const, label: <ListTree className="size-4" /> },
    { value: "json" as const, label: <Braces className="size-4" /> },
  ];

  const switchMode = (next: SchemaEditorMode) => {
    if (next === mode) return;
    // Уходя из полей, фиксируем их как JSON: обратный переход ничего не теряет.
    if (next === "json") onJsonChange(formatSchemaJson(fieldsToJsonSchema(fields)));
    onModeChange(next);
  };

  return (
    <div className="flex flex-col gap-4" data-testid="schema-editor">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {t("console.instructs.schema")}
          </span>
          {fieldsDisabled && (
            <span className="text-xs text-muted-foreground-lighter" data-testid="schema-complex">
              {t("console.instructs.schema.too-complex")}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!disabled && presetOptions.length > 0 && (
            <Select
              value={presetValue}
              onChange={(event) => onPresetChange(event.target.value)}
              options={presetOptions}
              className="w-56"
              placeholder={t("console.instructs.schema.preset")}
              data-testid="schema-preset-select"
            />
          )}

          <div data-testid="schema-mode">
            <ButtonGroup
              options={modeOptions}
              value={mode}
              onChange={switchMode}
              isIconButton
              variant="soft"
              size="sm"
              shape="circle"
              className="h-10 border border-border/40"
            />
          </div>
        </div>
      </div>

      {mode === "fields" && !fieldsDisabled ? (
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <SchemaFieldRow
              key={index}
              field={field}
              disabled={disabled}
              onChange={(next) =>
                onFieldsChange(fields.map((item, position) => (position === index ? next : item)))
              }
              onRemove={() => onFieldsChange(fields.filter((_, position) => position !== index))}
            />
          ))}

          {fields.length === 0 && (
            <p
              className="py-8 text-center text-caption text-muted-foreground-lighter"
              data-testid="schema-fields-empty"
            >
              {t("console.instructs.schema.empty")}
            </p>
          )}

          {!disabled && (
            <Button
              variant="outlined"
              shape="circle"
              size="sm"
              startIcon={<Plus />}
              className="w-fit"
              onClick={() => onFieldsChange([...fields, emptySchemaField(fields.length)])}
              data-testid="schema-add-field"
            >
              {t("console.instructs.schema.add-field")}
            </Button>
          )}
        </div>
      ) : (
        <Textarea
          value={json}
          onChange={(event) => onJsonChange(event.target.value)}
          rows={14}
          className="font-mono text-xs"
          disabled={disabled}
          error={error ?? undefined}
          data-testid="instruct-schema-input"
        />
      )}
    </div>
  );
}
