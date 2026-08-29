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
  "categories",
  "customers",
  "blogs",
  "research",
  "instructs",
  "team",
  "settings",
  "licensing",
];

/**
 * `bootstrap.services[]` содержит только переключаемые сервисы
 * (`cms-auth.php`: content, analytics, pay, licensing). `auth` — ядро, его там нет никогда.
 */
const ALL_SERVICES = [
  { key: "content", enabled: true },
  { key: "analytics", enabled: true },
  { key: "pay", enabled: true },
  { key: "licensing", enabled: true },
];

test("в консоли ровно девять разделов и у каждого есть требование платформы", () => {
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

  // Blogs и Categories ушли вместе с `content`; разделы `auth` остались.
  assert.deepEqual(keys, [
    "dashboard",
    "customers",
    "team",
    "settings",
    "licensing",
  ]);
});

test("licensing виден при включённом сервисе и праве pay.licensing.view", () => {
  const keys = visibleSectionKeys({
    services: [{ key: "licensing", enabled: true }],
    permissions: ["pay.licensing.view"],
  });

  assert.deepEqual(keys, ["licensing"]);
});

test("выключенный сервис licensing скрывает раздел даже при полном доступе", () => {
  const keys = visibleSectionKeys({
    services: ALL_SERVICES.map((s) =>
      s.key === "licensing" ? { ...s, enabled: false } : s,
    ),
    permissions: ["*"],
  });

  assert.ok(!keys.includes("licensing"));
  assert.ok(keys.includes("settings"));
});

test("licensing скрыт без права view, сервис при этом включён", () => {
  const keys = visibleSectionKeys({
    services: ALL_SERVICES,
    permissions: ["pay.licensing.manage", "auth.settings.view"],
  });

  assert.ok(!keys.includes("licensing"));
  assert.ok(keys.includes("settings"));
});

test("разделы ядра `auth` видны, хотя сервиса нет в bootstrap.services[]", () => {
  // Реальный ответ платформы для проекта demo.
  const keys = visibleSectionKeys({
    services: [
      { key: "content", enabled: true },
      { key: "analytics", enabled: true },
      { key: "pay", enabled: true },
      { key: "licensing", enabled: true },
    ],
    permissions: ["*"],
  });

  assert.deepEqual(keys, LIVE);
});
