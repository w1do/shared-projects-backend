import assert from "node:assert/strict";
import { test } from "node:test";

import { listStateMessage, showsEmptyState } from "./list-state.ts";

test("пока данные идут, показывается текст загрузки, а не «записей нет»", () => {
  assert.equal(listStateMessage(true, "Загрузка…", "Нет записей"), "Загрузка…");
});

test("после прихода данных показывается пустое состояние", () => {
  assert.equal(listStateMessage(false, "Загрузка…", "Нет записей"), "Нет записей");
});

test("пустое состояние не показывается во время загрузки", () => {
  assert.equal(showsEmptyState(true, 0), false);
  assert.equal(showsEmptyState(true, 5), false);
});

test("пустое состояние показывается только на пустом результате после загрузки", () => {
  assert.equal(showsEmptyState(false, 0), true);
  assert.equal(showsEmptyState(false, 1), false);
});
