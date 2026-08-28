import assert from "node:assert/strict";
import { test } from "node:test";

import { countChildren, descendantIds, flattenTree, invalidParentIds } from "./category-tree.ts";

/** Три уровня, как в демо-дереве: Аналитика → Рынок → Обзоры/Прогнозы. */
const TREE = [
  {
    id: "1",
    name: "Новости",
    parentId: null,
    children: [
      { id: "2", name: "Компания", parentId: "1", children: [] },
      { id: "3", name: "Продукт", parentId: "1", children: [] },
    ],
  },
  {
    id: "4",
    name: "Аналитика",
    parentId: null,
    children: [
      {
        id: "5",
        name: "Рынок",
        parentId: "4",
        children: [
          { id: "6", name: "Обзоры", parentId: "5", children: [] },
          { id: "7", name: "Прогнозы", parentId: "5", children: [] },
        ],
      },
      { id: "8", name: "Исследования", parentId: "4", children: [] },
    ],
  },
];

test("дерево раскладывается в префиксном порядке", () => {
  assert.deepEqual(
    flattenTree(TREE).map((n) => n.name),
    ["Новости", "Компания", "Продукт", "Аналитика", "Рынок", "Обзоры", "Прогнозы", "Исследования"],
  );
});

test("уровень вложенности соответствует дереву", () => {
  const byName = new Map(flattenTree(TREE).map((n) => [n.name, n.depth]));

  assert.equal(byName.get("Новости"), 0);
  assert.equal(byName.get("Компания"), 1);
  assert.equal(byName.get("Рынок"), 1);
  assert.equal(byName.get("Обзоры"), 2, "третий уровень");
  assert.equal(byName.get("Прогнозы"), 2);
});

test("пустое дерево даёт пустой список", () => {
  assert.deepEqual(flattenTree([]), []);
});

test("потомки собираются на всю глубину", () => {
  const flat = flattenTree(TREE);

  assert.deepEqual([...descendantIds(flat, "4")].sort(), ["5", "6", "7", "8"]);
  assert.deepEqual([...descendantIds(flat, "5")].sort(), ["6", "7"]);
  assert.deepEqual([...descendantIds(flat, "6")], [], "у листа потомков нет");
});

test("недопустимые родители — сам узел и всё его поддерево", () => {
  const flat = flattenTree(TREE);
  const invalid = invalidParentIds(flat, "5");

  assert.deepEqual([...invalid].sort(), ["5", "6", "7"]);
  assert.ok(!invalid.has("4"), "родитель узла остаётся допустимым");
  assert.ok(!invalid.has("1"), "чужая ветка остаётся допустимой");
});

test("лист можно перенести куда угодно, кроме себя самого", () => {
  const flat = flattenTree(TREE);

  assert.deepEqual([...invalidParentIds(flat, "6")], ["6"]);
});

test("прямые потомки считаются по плоскому списку, листья в карте отсутствуют", () => {
  const counts = countChildren(flattenTree(TREE));

  assert.equal(counts.get("1"), 2, "Новости: Компания и Продукт");
  assert.equal(counts.get("4"), 2, "Аналитика: Рынок и Исследования — без внуков");
  assert.equal(counts.get("5"), 2);
  assert.equal(counts.get("6"), undefined, "лист");
  assert.deepEqual(countChildren([]), new Map());
});
