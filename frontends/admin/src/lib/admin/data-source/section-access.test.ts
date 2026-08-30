import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CONSOLE_SECTION_KEYS,
  SECTION_REQUIREMENTS,
  visibleSectionKeys,
} from "./section-access.ts";

/** Порядок — каталожный (`CONSOLE_SECTION_KEYS`), а не алфавитный. */
const LIVE = [
  "dashboard",
  "blogs",
  "categories",
  "research",
  "instructs",
  "seo",
  "cities",
  "payments",
  "subscriptions",
  "plans",
  "license-plans",
  "licenses",
  "organizations",
  "releases",
  "customers",
  "team",
  "settings",
];

/**
 * `bootstrap.services[]` содержит только переключаемые сервисы
 * (`cms-auth.php`: content, analytics, pay). `auth` — ядро, его там нет никогда.
 */
const ALL_SERVICES = [
  { key: "content", enabled: true },
  { key: "analytics", enabled: true },
  { key: "pay", enabled: true },
];

test("у каждого раздела консоли есть требование платформы", () => {
  assert.deepEqual([...CONSOLE_SECTION_KEYS], LIVE);
  assert.deepEqual(Object.keys(SECTION_REQUIREMENTS).sort(), [...LIVE].sort());
});

test("супер-администратор видит все живые разделы", () => {
  assert.deepEqual(
    visibleSectionKeys({ services: ALL_SERVICES, permissions: ["*"] }),
    LIVE,
  );
});

test("оператор без права не видит свой раздел", () => {
  const permissions = Object.values(SECTION_REQUIREMENTS)
    .map((requirement) => requirement.permission)
    .filter((permission) => permission !== "content.posts.view");

  const keys = visibleSectionKeys({ services: ALL_SERVICES, permissions });

  assert.ok(!keys.includes("blogs"));
  assert.ok(keys.includes("categories"));
});

test("выключенный сервис убирает свои разделы, ядро не трогает", () => {
  const keys = visibleSectionKeys({
    services: ALL_SERVICES.map((s) =>
      s.key === "content" ? { ...s, enabled: false } : s,
    ),
    permissions: ["*"],
  });

  // Вся группа «Контент» ушла вместе с сервисом; разделы `auth` остались.
  assert.deepEqual(keys, [
    "dashboard",
    "payments",
    "subscriptions",
    "plans",
    "license-plans",
    "licenses",
    "organizations",
    "releases",
    "customers",
    "team",
    "settings",
  ]);
});

test("группа «Оплата» появляется целиком вместе с сервисом pay", () => {
  const keys = visibleSectionKeys({
    services: [{ key: "pay", enabled: true }],
    permissions: ["*"],
  });

  assert.deepEqual(keys, [
    "payments",
    "subscriptions",
    "plans",
    "license-plans",
    "licenses",
    "organizations",
    "releases",
    "customers",
    "team",
    "settings",
  ]);
});

test("выключенная оплата скрывает и лицензирование: отдельного тумблера нет", () => {
  const keys = visibleSectionKeys({
    services: ALL_SERVICES.map((s) =>
      s.key === "pay" ? { ...s, enabled: false } : s,
    ),
    permissions: ["*"],
  });

  assert.ok(!keys.includes("licenses"));
  assert.ok(!keys.includes("payments"));
  assert.ok(keys.includes("settings"));
});

test("разделы лицензирования видны по праву pay.licensing.view", () => {
  const keys = visibleSectionKeys({
    services: [{ key: "pay", enabled: true }],
    permissions: ["pay.licensing.view"],
  });

  assert.deepEqual(keys, [
    "license-plans",
    "licenses",
    "organizations",
    "releases",
  ]);
});

test("раздел SEO закрыт правом content.seo.manage", () => {
  const keys = visibleSectionKeys({
    services: [{ key: "content", enabled: true }],
    permissions: ["content.posts.view"],
  });

  assert.ok(!keys.includes("seo"));
  assert.ok(keys.includes("blogs"));
});

test("разделы ядра `auth` видны, хотя сервиса нет в bootstrap.services[]", () => {
  // Реальный ответ платформы для проекта demo.
  const keys = visibleSectionKeys({
    services: ALL_SERVICES,
    permissions: ["*"],
  });

  assert.deepEqual(keys, LIVE);
});
