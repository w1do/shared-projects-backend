import assert from "node:assert/strict";
import { test } from "node:test";

import { computeBlogsKpiValues, type BlogsKpiArticle } from "./blogs-kpi.ts";

function article(overrides: Partial<BlogsKpiArticle> = {}): BlogsKpiArticle {
  return {
    category: "Рубрика",
    author: { name: "Автор" },
    readingTimeMin: 5,
    ...overrides,
  };
}

test("пустой список даёт нули по всем показателям", () => {
  assert.deepEqual(computeBlogsKpiValues([]), {
    publishedCount: 0,
    categoriesCount: 0,
    authorsCount: 0,
    averageReadMinutes: 0,
  });
});

test("без статусов (демо-данные) опубликованным считается весь список", () => {
  const values = computeBlogsKpiValues([article(), article(), article()]);
  assert.equal(values.publishedCount, 3);
});

test("со статусами считаются только опубликованные статьи", () => {
  const values = computeBlogsKpiValues([
    article({ status: "published" }),
    article({ status: "draft" }),
    article({ status: "archived" }),
    article({ status: "published" }),
  ]);
  assert.equal(values.publishedCount, 2);
});

test("статья без статуса среди статусных не считается опубликованной", () => {
  const values = computeBlogsKpiValues([
    article({ status: "draft" }),
    article(),
  ]);
  assert.equal(values.publishedCount, 0);
});

test("рубрики и авторы считаются без дублей", () => {
  const values = computeBlogsKpiValues([
    article({ category: "Ритуалы", author: { name: "Анна" } }),
    article({ category: "Ритуалы", author: { name: "Мария" } }),
    article({ category: "Наука", author: { name: "Анна" } }),
  ]);
  assert.equal(values.categoriesCount, 2);
  assert.equal(values.authorsCount, 2);
});

test("среднее время чтения округляется до целых минут", () => {
  const values = computeBlogsKpiValues([
    article({ readingTimeMin: 4 }),
    article({ readingTimeMin: 5 }),
  ]);
  // 4.5 → 5: Math.round, а не отбрасывание дробной части.
  assert.equal(values.averageReadMinutes, 5);
});
