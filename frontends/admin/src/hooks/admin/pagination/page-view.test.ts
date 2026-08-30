import assert from "node:assert/strict";
import { test } from "node:test";

import { nextPage, pageView } from "./page-view.ts";

const items = (count: number) => Array.from({ length: count }, (_, index) => index + 1);

test("смена фильтра возвращает оператора на первую страницу", () => {
  assert.equal(nextPage(3, true, 5), 1);
});

test("уменьшение числа записей не оставляет на несуществующей странице", () => {
  assert.equal(nextPage(3, false, 1), 1);
  assert.equal(nextPage(9, false, 4), 4);
});

test("страница в пределах списка остаётся прежней", () => {
  assert.equal(nextPage(3, false, 5), 3);
});

test("срез страницы и диапазон записей считаются от размера страницы", () => {
  const view = pageView(items(20), 2, 8);

  assert.deepEqual(view.items, [9, 10, 11, 12, 13, 14, 15, 16]);
  assert.equal(view.page, 2);
  assert.equal(view.totalPages, 3);
  assert.equal(view.startItem, 9);
  assert.equal(view.endItem, 16);
});

test("после удаления записей срез берётся с последней существующей страницы", () => {
  const view = pageView(items(9), 3, 8);

  assert.equal(view.page, 2);
  assert.deepEqual(view.items, [9]);
  assert.equal(view.startItem, 9);
  assert.equal(view.endItem, 9);
});

test("пустой список даёт одну страницу и нулевой диапазон", () => {
  const view = pageView([], 1, 8);

  assert.deepEqual(view.items, []);
  assert.equal(view.totalPages, 1);
  assert.equal(view.startItem, 0);
  assert.equal(view.endItem, 0);
});
