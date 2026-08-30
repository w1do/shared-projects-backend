/**
 * Схема ответа модели как список полей.
 *
 * Оператор задаёт поля, а не набирает JSON: имя, тип, обязательность и краткое
 * назначение. Здесь — типы полей и сборка JSON Schema из них; обратное чтение
 * схемы живёт в `schema-reader.ts`.
 *
 * Редактор представляет ровно то, что платформа разбирает: плоские объекты,
 * вложенные объекты, массивы объектов и массивы скаляров. Схему за пределами
 * этого набора (комбинаторы, `$ref`, произвольные ключевые слова) редактор
 * НЕ упрощает: `supported: false` означает «открывать сразу в JSON-режиме».
 */
export type ScalarFieldType = "string" | "number" | "boolean";
export type SchemaFieldType = ScalarFieldType | "object" | "array";

/** Элемент массива: скаляр или объект со своими полями. */
export type SchemaArrayItem = {
  type: ScalarFieldType | "object";
  fields?: SchemaField[];
};

export type SchemaField = {
  name: string;
  type: SchemaFieldType;
  required: boolean;
  description?: string;
  /** Вложенные поля объекта. */
  fields?: SchemaField[];
  /** Описание элемента массива. */
  item?: SchemaArrayItem;
};

export type SchemaFieldsResult = {
  fields: SchemaField[];
  /** Схема представима списком полей; иначе редактор её не открывает. */
  supported: boolean;
};

/** Ключевые слова, которых редактор не умеет: их присутствие делает схему «сложнее редактора». */
const UNSUPPORTED_KEYWORDS = [
  "oneOf",
  "anyOf",
  "allOf",
  "not",
  "$ref",
  "patternProperties",
];

export const SCALARS: ScalarFieldType[] = ["string", "number", "boolean"];

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Тип свойства: `["string","null"]` платформы читается как `string`. */
export function readType(node: Record<string, unknown>): string | null {
  const type = node.type;
  if (typeof type === "string") return type;
  if (Array.isArray(type)) {
    const named = type.find(
      (item) => typeof item === "string" && item !== "null",
    );
    return typeof named === "string" ? named : null;
  }
  return null;
}

export function hasUnsupportedKeywords(node: Record<string, unknown>): boolean {
  return UNSUPPORTED_KEYWORDS.some((keyword) => keyword in node);
}

/** Поле → узел JSON Schema. */
function fieldToNode(field: SchemaField): Record<string, unknown> {
  const node: Record<string, unknown> = { type: field.type };

  if (field.description) node.description = field.description;

  if (field.type === "object") {
    Object.assign(node, objectNode(field.fields ?? []));
  }

  if (field.type === "array") {
    const item = field.item ?? { type: "string" };
    node.items =
      item.type === "object"
        ? { type: "object", ...objectNode(item.fields ?? []) }
        : { type: item.type };
  }

  return node;
}

/** Список полей → тело объекта JSON Schema (`properties` + `required`). */
function objectNode(fields: SchemaField[]): Record<string, unknown> {
  const properties: Record<string, unknown> = {};
  const required: string[] = [];

  for (const field of fields) {
    const name = field.name.trim();
    if (name === "") continue;

    properties[name] = fieldToNode(field);
    if (field.required) required.push(name);
  }

  return { properties, required };
}

/** Список полей → JSON Schema объекта ответа. */
export function fieldsToJsonSchema(
  fields: SchemaField[],
): Record<string, unknown> {
  return { type: "object", ...objectNode(fields) };
}

/** Поле по умолчанию для кнопки «добавить поле». */
export function emptySchemaField(index: number): SchemaField {
  return {
    name: `field_${index + 1}`,
    type: "string",
    required: false,
    description: "",
  };
}

export { jsonSchemaToFields } from "./schema-reader.ts";
