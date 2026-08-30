import assert from "node:assert/strict";
import { test } from "node:test";

import { postToArticle, projectUserToCustomer } from "./mappers.ts";

const USER = {
  id: 7,
  name: "Анна",
  email: "anna@example.com",
  project_id: "demo",
  blocked: false,
};

test("пользователь платформы → клиент вёрстки без выдуманного уровня лояльности", () => {
  const customer = projectUserToCustomer(USER);

  assert.equal(customer.id, "7");
  assert.equal(customer.name, "Анна");
  assert.equal(customer.email, "anna@example.com");
  assert.equal(customer.status, "Active");
  assert.equal(
    customer.tier,
    undefined,
    "tier не назначается — платформа лояльность не ведёт",
  );
});

test("blocked → Inactive; имя падает обратно на email", () => {
  const customer = projectUserToCustomer({
    ...USER,
    name: null,
    blocked: true,
  });

  assert.equal(customer.status, "Inactive");
  assert.equal(customer.name, "anna@example.com");
});

/** Пост платформы с блоками: идентификаторы обязаны дожить до формы. */
const POST_WITH_BLOCKS = {
  id: 42,
  title: "Какие бывают авто",
  slug: "kakie-byvayut-avto",
  body: "## Седаны\n\nТекст про седаны.",
  locale: "ru",
  status: "draft" as const,
  is_index: true,
  is_featured: false,
  categories: [3],
  blocks: [
    { id: "01BLOCKONE", title: "Седаны", markdown: "Текст про седаны." },
    { id: "01BLOCKTWO", title: "", markdown: "Блок без названия." },
  ],
};

test("блоки поста доезжают до статьи вёрстки с идентификаторами и порядком", () => {
  const article = postToArticle(POST_WITH_BLOCKS, new Map([[3, "Авто"]]));

  assert.deepEqual(article.blocks, [
    { id: "01BLOCKONE", title: "Седаны", markdown: "Текст про седаны." },
    { id: "01BLOCKTWO", title: "", markdown: "Блок без названия." },
  ]);
});

test("пост без блоков даёт пустой список, а не выдуманный блок", () => {
  const article = postToArticle({ ...POST_WITH_BLOCKS, blocks: [] }, new Map());

  assert.deepEqual(article.blocks, []);
});

test("непереданные блоки трактуются как пустое содержимое", () => {
  const { blocks: _blocks, ...withoutBlocks } = POST_WITH_BLOCKS;
  const article = postToArticle(withoutBlocks, new Map());

  assert.deepEqual(article.blocks, []);
});
