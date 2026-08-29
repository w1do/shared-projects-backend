import assert from "node:assert/strict";
import { test } from "node:test";

import { formatSchemaJson, parseSchemaJson } from "./schema-json.ts";

test("корректная схема разбирается в объект", () => {
  const result = parseSchemaJson(
    '{"type":"object","properties":{"title":{"type":"string"}}}',
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.ok && result.value, {
    type: "object",
    properties: { title: { type: "string" } },
  });
});

test("некорректный JSON отклоняется до отправки", () => {
  const result = parseSchemaJson('{"type": object}');

  assert.equal(result.ok, false);
});

test("пустое поле схемой не считается", () => {
  assert.equal(parseSchemaJson("   ").ok, false);
});

test("массив и скаляр схемой ответа не являются", () => {
  assert.equal(parseSchemaJson("[1,2,3]").ok, false);
  assert.equal(parseSchemaJson('"строка"').ok, false);
  assert.equal(parseSchemaJson("null").ok, false);
});

test("пустая схема показывается заготовкой объекта", () => {
  assert.equal(
    formatSchemaJson(undefined),
    JSON.stringify({ type: "object", properties: {}, required: [] }, null, 2),
  );
});

test("существующая схема форматируется читаемо", () => {
  const formatted = formatSchemaJson({ type: "object", required: ["title"] });

  assert.equal(formatted.includes("\n"), true);
  assert.deepEqual(JSON.parse(formatted), {
    type: "object",
    required: ["title"],
  });
});
