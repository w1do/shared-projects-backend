import assert from "node:assert/strict";
import { test } from "node:test";

import {
  fieldsToJsonSchema,
  jsonSchemaToFields,
  type SchemaField,
} from "./schema-fields.ts";

/** Пресет категорий платформы: массив объектов с обязательными полями. */
const CATEGORY_FIELDS: SchemaField[] = [
  {
    name: "categories",
    type: "array",
    required: true,
    description: "Плоский список категорий",
    item: {
      type: "object",
      fields: [
        {
          name: "name",
          type: "string",
          required: true,
          description: "Название",
        },
        { name: "slug", type: "string", required: true, description: "Слаг" },
        {
          name: "parent_slug",
          type: "string",
          required: false,
          description: "Слаг родителя",
        },
      ],
    },
  },
];

test("плоские поля превращаются в JSON Schema с required", () => {
  const schema = fieldsToJsonSchema([
    { name: "title", type: "string", required: true, description: "Заголовок" },
    { name: "count", type: "number", required: false },
  ]);

  assert.deepEqual(schema, {
    type: "object",
    properties: {
      title: { type: "string", description: "Заголовок" },
      count: { type: "number" },
    },
    required: ["title"],
  });
});

test("поля без имени в схему не попадают", () => {
  const schema = fieldsToJsonSchema([
    { name: "  ", type: "string", required: true },
    { name: "kept", type: "string", required: false },
  ]);

  assert.deepEqual(
    Object.keys((schema.properties as Record<string, unknown>) ?? {}),
    ["kept"],
  );
});

test("массив объектов сохраняет поля элемента", () => {
  const schema = fieldsToJsonSchema(CATEGORY_FIELDS);

  assert.deepEqual(schema, {
    type: "object",
    properties: {
      categories: {
        type: "array",
        description: "Плоский список категорий",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Название" },
            slug: { type: "string", description: "Слаг" },
            parent_slug: { type: "string", description: "Слаг родителя" },
          },
          required: ["name", "slug"],
        },
      },
    },
    required: ["categories"],
  });
});

test("круговое преобразование не теряет полей", () => {
  const fields: SchemaField[] = [
    ...CATEGORY_FIELDS,
    { name: "topic", type: "string", required: true, description: "Тема" },
    {
      name: "tags",
      type: "array",
      required: false,
      description: "Теги",
      item: { type: "string" },
    },
    {
      name: "meta",
      type: "object",
      required: false,
      fields: [
        {
          name: "locale",
          type: "string",
          required: true,
          description: "Локаль",
        },
      ],
    },
    { name: "is_index", type: "boolean", required: false },
  ];

  const back = jsonSchemaToFields(fieldsToJsonSchema(fields));

  assert.equal(back.supported, true);
  assert.deepEqual(back.fields, fields);
});

test("тип с null читается как основной тип", () => {
  const back = jsonSchemaToFields({
    type: "object",
    properties: { parent_slug: { type: ["string", "null"] } },
    required: [],
  });

  assert.equal(back.supported, true);
  assert.deepEqual(back.fields, [
    { name: "parent_slug", type: "string", required: false },
  ]);
});

test("объект без properties остаётся допустимым свободным объектом", () => {
  const back = jsonSchemaToFields({
    type: "object",
    properties: { json_ld: { type: "object" } },
    required: [],
  });

  assert.equal(back.supported, true);
  assert.deepEqual(back.fields, [
    { name: "json_ld", type: "object", required: false, fields: [] },
  ]);
});

test("пустая схема даёт пустой список полей", () => {
  assert.deepEqual(jsonSchemaToFields({}), { fields: [], supported: true });
  assert.deepEqual(jsonSchemaToFields(undefined), {
    fields: [],
    supported: true,
  });
});

test("комбинаторы и $ref помечают схему как сложнее редактора", () => {
  for (const schema of [
    { oneOf: [{ type: "object" }] },
    { type: "object", properties: { a: { $ref: "#/definitions/a" } } },
    { type: "object", properties: { a: { anyOf: [{ type: "string" }] } } },
    {
      type: "object",
      properties: { a: { type: "array", items: { oneOf: [] } } },
    },
  ]) {
    const result = jsonSchemaToFields(schema);
    assert.equal(result.supported, false, JSON.stringify(schema));
    assert.deepEqual(result.fields, []);
  }
});

test("неподдерживаемый тип свойства уводит схему в JSON-режим", () => {
  assert.equal(
    jsonSchemaToFields({ type: "array", items: { type: "string" } }).supported,
    false,
  );
  assert.equal(
    jsonSchemaToFields({
      type: "object",
      properties: { a: { type: "integer" } },
    }).supported,
    false,
  );
});
