import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CONSOLE_SECTION_KEYS,
  SECTION_REQUIREMENTS,
  decodeSectionSnapshot,
  isDemoSection,
  persistSectionSnapshot,
  sectionKeyOfPath,
  sectionSnapshotRevision,
  selectVisibleQuickActions,
  selectVisibleSections,
  subscribeSectionSnapshot,
  visibleSectionKeys,
} from "./section-access.ts";

/** Порядок — каталожный (`CONSOLE_SECTION_KEYS`), а не алфавитный. */
const LIVE = ["dashboard", "categories", "customers", "blogs", "team", "settings"];

/**
 * `bootstrap.services[]` содержит только переключаемые сервисы
 * (`cms-auth.php`: content, analytics, pay). `auth` — ядро, его там нет никогда.
 */
const ALL_SERVICES = [
  { key: "content", enabled: true },
  { key: "analytics", enabled: true },
  { key: "pay", enabled: true },
];

test("требование объявлено ровно для шести живых разделов", () => {
  assert.deepEqual(
    CONSOLE_SECTION_KEYS.filter((key) => key in SECTION_REQUIREMENTS),
    LIVE,
  );
  assert.equal(
    CONSOLE_SECTION_KEYS.filter((key) => isDemoSection(key)).length,
    CONSOLE_SECTION_KEYS.length - LIVE.length,
  );
});

test("супер-администратор видит все живые разделы", () => {
  assert.deepEqual(visibleSectionKeys({ services: ALL_SERVICES, permissions: ["*"] }), LIVE);
});

test("оператор без права не видит свой раздел", () => {
  const permissions = Object.values(SECTION_REQUIREMENTS)
    .map((requirement) => requirement!.permission)
    .filter((permission) => permission !== "content.posts.view");

  const keys = visibleSectionKeys({ services: ALL_SERVICES, permissions });

  assert.ok(!keys.includes("blogs"));
  assert.ok(keys.includes("categories"));
});

test("выключенный сервис убирает свои разделы, ядро не трогает", () => {
  const keys = visibleSectionKeys({
    services: ALL_SERVICES.map((s) => (s.key === "content" ? { ...s, enabled: false } : s)),
    permissions: ["*"],
  });

  // Blogs и Categories ушли вместе с `content`; разделы `auth` остались.
  assert.deepEqual(keys, ["dashboard", "customers", "team", "settings"]);
});

test("разделы ядра `auth` видны, хотя сервиса нет в bootstrap.services[]", () => {
  // Реальный ответ платформы для проекта demo.
  const keys = visibleSectionKeys({
    services: [
      { key: "content", enabled: true },
      { key: "analytics", enabled: true },
      { key: "pay", enabled: true },
    ],
    permissions: ["*"],
  });

  assert.deepEqual(keys, LIVE);
});

test("селектор сохраняет порядок и выбрасывает пустые группы", () => {
  const groups = [
    {
      label: "Overview",
      items: [{ title: "Dashboard", section: "dashboard" }],
    },
    {
      label: "Catalog",
      items: [{ title: "Products", section: "products" }],
    },
    {
      label: "Workspace",
      items: [
        { title: "Blogs", section: "blogs" },
        { title: "Team", section: "team" },
        { title: "Settings", section: "settings" },
      ],
    },
  ];

  // Снимок без прав на `blogs`.
  const visible = selectVisibleSections(groups, ["dashboard", "team", "settings"]);

  assert.deepEqual(
    visible.map((group) => [group.label, group.items.map((item) => item.title)]),
    [
      ["Overview", ["Dashboard"]],
      ["Workspace", ["Team", "Settings"]],
    ],
  );
});

test("быстрые действия скрытых разделов не отображаются", () => {
  const actions = [
    { title: "Add product", section: "products" },
    { title: "New promotion", section: "promotions" },
    { title: "Import inventory", section: "inventory" },
    { title: "Create collection", section: "collections" },
    { title: "Launch campaign", section: "campaigns" },
    { title: "Invite teammate", section: "team" },
  ];

  assert.deepEqual(
    selectVisibleQuickActions(actions, LIVE).map((action) => action.title),
    ["Invite teammate"],
  );
});

test("адрес раздела → ключ; служебные адреса ключа не имеют", () => {
  assert.equal(sectionKeyOfPath("/admin"), "dashboard");
  assert.equal(sectionKeyOfPath("/admin/"), "dashboard");
  assert.equal(sectionKeyOfPath("/admin/products"), "products");
  assert.equal(sectionKeyOfPath("/admin/products/add"), "products");
  assert.equal(sectionKeyOfPath("/admin/unauthorized"), undefined);
  assert.equal(sectionKeyOfPath("/login"), undefined);
});

test("запись снимка уведомляет подписчиков — меню перечитывает состав сразу", () => {
  let notified = 0;
  const unsubscribe = subscribeSectionSnapshot(() => {
    notified += 1;
  });

  const before = sectionSnapshotRevision();
  // Переключение сервиса из настроек: bootstrap перечитан → снимок переписан.
  persistSectionSnapshot(["dashboard", "customers", "team", "settings"], 60);

  assert.equal(notified, 1);
  assert.ok(sectionSnapshotRevision() > before);

  unsubscribe();
  persistSectionSnapshot(["dashboard"], 60);
  assert.equal(notified, 1);
});

test("отсутствующая cookie снимка не блокирует навигацию", () => {
  assert.deepEqual(decodeSectionSnapshot(undefined), []);
  assert.deepEqual(decodeSectionSnapshot(""), []);
  assert.deepEqual(decodeSectionSnapshot("dashboard,blogs"), ["dashboard", "blogs"]);
});
