"use client";

import * as React from "react";
import { t } from "@/lib/admin/console-texts";
import {
  fieldsToJsonSchema,
  jsonSchemaToFields,
  type SchemaField,
} from "@/lib/admin/instructs/schema-fields";
import { formatSchemaJson, parseSchemaJson } from "@/lib/admin/instructs/schema-json";
import type { PlatformInstruct, PlatformSchemaPreset } from "@/lib/admin/services";
import type { SchemaEditorMode } from "@/components/pages/instructs/sections/schema-editor";

/** Поле пресета платформы → поле редактора: формы совпадают, описание необязательно. */
function presetToFields(preset: PlatformSchemaPreset): SchemaField[] {
  const map = (fields: PlatformSchemaPreset["fields"]): SchemaField[] =>
    fields.map((field) => ({
      name: field.name,
      type: field.type,
      required: field.required,
      ...(field.description ? { description: field.description } : {}),
      ...(field.fields ? { fields: map(field.fields) } : {}),
      ...(field.item
        ? {
            item: {
              type: field.item.type,
              ...(field.item.fields ? { fields: map(field.item.fields) } : {}),
            },
          }
        : {}),
    }));

  return map(preset.fields);
}

export function useInstructForm(instruct: PlatformInstruct | null, presets: PlatformSchemaPreset[]) {
  const parsed = React.useMemo(() => jsonSchemaToFields(instruct?.schema), [instruct]);

  const [title, setTitle] = React.useState(instruct?.title ?? "");
  const [category, setCategory] = React.useState(instruct?.category ?? "");
  const [rule, setRule] = React.useState(instruct?.rule ?? "");
  const [published, setPublished] = React.useState(instruct?.published ?? false);
  const [fields, setFields] = React.useState<SchemaField[]>(parsed.fields);
  const [json, setJson] = React.useState(formatSchemaJson(instruct?.schema));
  // Схема сложнее редактора открывается сразу в JSON-режиме и не упрощается.
  const [mode, setMode] = React.useState<SchemaEditorMode>(parsed.supported ? "fields" : "json");
  const [schemaError, setSchemaError] = React.useState<string | null>(null);
  const [pendingPreset, setPendingPreset] = React.useState<PlatformSchemaPreset | null>(null);

  /** Применимые к выбранной категории пресеты идут первыми. */
  const presetOptions = React.useMemo(() => {
    const applicable = presets.filter((preset) => preset.categories.includes(category));
    const rest = presets.filter((preset) => !preset.categories.includes(category));

    return [
      { value: "", label: t("console.instructs.schema.preset") },
      ...[...applicable, ...rest].map((preset) => ({ value: preset.key, label: preset.title })),
    ];
  }, [presets, category]);

  /** Пресет, предлагаемый по категории инструкции по умолчанию. */
  const suggestedPreset = React.useMemo(
    () => presets.find((preset) => preset.categories.includes(category))?.key ?? "",
    [presets, category],
  );

  const applyPreset = React.useCallback((preset: PlatformSchemaPreset) => {
    const next = presetToFields(preset);
    setFields(next);
    setJson(formatSchemaJson(fieldsToJsonSchema(next)));
    setMode("fields");
    setSchemaError(null);
  }, []);

  /** Заполненная схема заменяется только после явного подтверждения. */
  const requestPreset = React.useCallback(
    (key: string) => {
      const preset = presets.find((item) => item.key === key);
      if (!preset) return;

      if (fields.length > 0) {
        setPendingPreset(preset);
        return;
      }
      applyPreset(preset);
    },
    [presets, fields, applyPreset],
  );

  const confirmPreset = React.useCallback(() => {
    if (!pendingPreset) return;
    applyPreset(pendingPreset);
    setPendingPreset(null);
  }, [pendingPreset, applyPreset]);

  /** Схема на отправку: из полей или из JSON — по текущему режиму. */
  const schemaForSubmit = React.useCallback((): Record<string, unknown> | null => {
    if (mode === "fields") return fieldsToJsonSchema(fields);

    const result = parseSchemaJson(json);
    if (!result.ok) {
      setSchemaError(t("console.instructs.schema-invalid"));
      return null;
    }

    setSchemaError(null);
    return result.value;
  }, [mode, fields, json]);

  return {
    title,
    setTitle,
    category,
    setCategory,
    rule,
    setRule,
    published,
    setPublished,
    fields,
    setFields,
    json,
    setJson: (value: string) => {
      setJson(value);
      setSchemaError(null);
    },
    mode,
    setMode,
    fieldsDisabled: !parsed.supported,
    schemaError,
    presetOptions,
    suggestedPreset,
    requestPreset,
    pendingPreset,
    cancelPreset: () => setPendingPreset(null),
    confirmPreset,
    schemaForSubmit,
  };
}
