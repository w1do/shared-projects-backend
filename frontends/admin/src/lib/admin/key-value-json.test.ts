import assert from "node:assert/strict";
import { test } from "node:test";

import {
  formatJsonObject,
  objectToPairs,
  pairsToObject,
  parseJsonObject,
} from "./key-value-json.ts";

test("объект → пары: скаляры как есть, вложенные структуры JSON-строкой", () => {
  const pairs = objectToPairs({
    merchant_id: "m-1",
    payment_method: 2,
    enabled: true,
    nested: { a: 1 },
  });

  assert.deepEqual(pairs, [
    { key: "merchant_id", value: "m-1" },
    { key: "payment_method", value: "2" },
    { key: "enabled", value: "true" },
    { key: "nested", value: '{"a":1}' },
  ]);
});

test("пары → объект: числа и JSON распознаются, пустые ключи пропускаются", () => {
  const value = pairsToObject([
    { key: "merchant_id", value: "m-1" },
    { key: "payment_method", value: "2" },
    { key: "nested", value: '{"a":1}' },
    { key: "  ", value: "ignored" },
    { key: "quoted", value: '"2"' },
  ]);

  assert.deepEqual(value, {
    merchant_id: "m-1",
    payment_method: 2,
    nested: { a: 1 },
    quoted: "2",
  });
});

test("пары ↔ объект согласованы: введённое в одном режиме видно в другом", () => {
  const source = { secret: "s-1", timeout: 15, flags: { retry: false } };

  assert.deepEqual(pairsToObject(objectToPairs(source)), source);
});

test("дубликат ключа — побеждает последняя строка", () => {
  const value = pairsToObject([
    { key: "secret", value: "old" },
    { key: "secret", value: "new" },
  ]);

  assert.deepEqual(value, { secret: "new" });
});

test("разбор сырого JSON принимает только объект", () => {
  assert.deepEqual(parseJsonObject('{"a": 1}'), { ok: true, value: { a: 1 } });
  assert.deepEqual(parseJsonObject("{oops"), { ok: false, error: "invalid-json" });
  assert.deepEqual(parseJsonObject("[1, 2]"), { ok: false, error: "not-an-object" });
  assert.deepEqual(parseJsonObject('"строка"'), { ok: false, error: "not-an-object" });
});

test("formatJsonObject выводит читаемый JSON с отступами", () => {
  assert.equal(formatJsonObject({ a: 1 }), '{\n  "a": 1\n}');
});
