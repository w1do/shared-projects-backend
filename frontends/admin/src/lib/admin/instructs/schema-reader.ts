/**
 * Чтение JSON Schema в список полей редактора.
 *
 * Обратная сторона `schema-fields.ts`: схема, которую редактор представить не
 * может, возвращается как `supported: false` — её открывают в JSON-режиме.
 */

import {
  SCALARS,
  hasUnsupportedKeywords,
  isRecord,
  readType,
  type ScalarFieldType,
  type SchemaField,
  type SchemaFieldsResult,
} from "./schema-fields";

/** Узел JSON Schema → поле; `null` означает «редактор это не представляет». */
function nodeToField(
  name: string,
  node: unknown,
  required: boolean,
): SchemaField | null {
  if (!isRecord(node) || hasUnsupportedKeywords(node)) return null;

  const type = readType(node);
  // Пустого `description` в поле не остаётся: круговое преобразование обязано
  // вернуть ровно тот же список полей, что был задан.
  const described =
    typeof node.description === "string"
      ? { description: node.description }
      : {};

  if (type !== null && (SCALARS as string[]).includes(type)) {
    return { name, type: type as ScalarFieldType, required, ...described };
  }

  if (type === "object") {
    const nested = objectToFields(node);
    if (nested === null) return null;
    return { name, type: "object", required, ...described, fields: nested };
  }

  if (type === "array") {
    const items = node.items;
    if (!isRecord(items) || hasUnsupportedKeywords(items)) return null;

    const itemType = readType(items);

    if (itemType !== null && (SCALARS as string[]).includes(itemType)) {
      return {
        name,
        type: "array",
        required,
        ...described,
        item: { type: itemType as ScalarFieldType },
      };
    }

    if (itemType === "object") {
      const nested = objectToFields(items);
      if (nested === null) return null;
      return {
        name,
        type: "array",
        required,
        ...described,
        item: { type: "object", fields: nested },
      };
    }

    return null;
  }

  return null;
}

/** Тело объекта JSON Schema → список полей; `null` — схема сложнее редактора. */
function objectToFields(node: Record<string, unknown>): SchemaField[] | null {
  const properties = node.properties;

  // Объект без описанных свойств — допустимый «свободный» объект
  if (properties === undefined) return [];
  if (!isRecord(properties)) return null;

  const required = Array.isArray(node.required)
    ? node.required.filter((item): item is string => typeof item === "string")
    : [];

  const fields: SchemaField[] = [];

  for (const [name, child] of Object.entries(properties)) {
    const field = nodeToField(name, child, required.includes(name));
    if (field === null) return null;
    fields.push(field);
  }

  return fields;
}

/** JSON Schema → список полей редактора и признак представимости. */
export function jsonSchemaToFields(
  schema: Record<string, unknown> | undefined,
): SchemaFieldsResult {
  if (!schema || Object.keys(schema).length === 0)
    return { fields: [], supported: true };
  if (hasUnsupportedKeywords(schema)) return { fields: [], supported: false };

  const type = readType(schema);
  if (type !== null && type !== "object")
    return { fields: [], supported: false };

  const fields = objectToFields(schema);

  return fields === null
    ? { fields: [], supported: false }
    : { fields, supported: true };
}
