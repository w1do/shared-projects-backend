/**
 * Схема ответа модели как список полей.
 *
 * Оператор задаёт поля, а не набирает JSON: имя, тип, обязательность и краткое
 * назначение. Здесь живёт преобразование «поля ↔ JSON Schema» в обе стороны —
 * чистыми функциями без зависимостей, поэтому оно покрыто node-тестами.
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
const UNSUPPORTED_KEYWORDS = ["oneOf", "anyOf", "allOf", "not", "$ref", "patternProperties"];

const SCALARS: ScalarFieldType[] = ["string", "number", "boolean"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Тип свойства: `["string","null"]` платформы читается как `string`. */
function readType(node: Record<string, unknown>): string | null {
  const type = node.type;
  if (typeof type === "string") return type;
  if (Array.isArray(type)) {
    const named = type.find((item) => typeof item === "string" && item !== "null");
    return typeof named === "string" ? named : null;
  }
  return null;
}

function hasUnsupportedKeywords(node: Record<string, unknown>): boolean {
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
export function fieldsToJsonSchema(fields: SchemaField[]): Record<string, unknown> {
  return { type: "object", ...objectNode(fields) };
}

/** Узел JSON Schema → поле; `null` означает «редактор это не представляет». */
function nodeToField(name: string, node: unknown, required: boolean): SchemaField | null {
  if (!isRecord(node) || hasUnsupportedKeywords(node)) return null;

  const type = readType(node);
  // Пустого `description` в поле не остаётся: круговое преобразование обязано
  // вернуть ровно тот же список полей, что был задан.
  const described =
    typeof node.description === "string" ? { description: node.description } : {};

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
      return { name, type: "array", required, ...described, item: { type: "object", fields: nested } };
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
export function jsonSchemaToFields(schema: Record<string, unknown> | undefined): SchemaFieldsResult {
  if (!schema || Object.keys(schema).length === 0) return { fields: [], supported: true };
  if (hasUnsupportedKeywords(schema)) return { fields: [], supported: false };

  const type = readType(schema);
  if (type !== null && type !== "object") return { fields: [], supported: false };

  const fields = objectToFields(schema);

  return fields === null ? { fields: [], supported: false } : { fields, supported: true };
}

/** Поле по умолчанию для кнопки «добавить поле». */
export function emptySchemaField(index: number): SchemaField {
  return { name: `field_${index + 1}`, type: "string", required: false, description: "" };
}
