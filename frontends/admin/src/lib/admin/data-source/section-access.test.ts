import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CONSOLE_SECTION_KEYS,
  SECTION_REQUIREMENTS,
  decodeSectionSnapshot,
  persistSectionSnapshot,
  sectionKeyOfPath,
  sectionSnapshotRevision,
  selectVisibleQuickActions,
  selectVisibleSections,
  subscribeSectionSnapshot,
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
  assert.deepEqual(visibleSectionKeys({ services: ALL_SERVICES, permissions: ["*"] }), LIVE);
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
    services: ALL_SERVICES.map((s) => (s.key === "content" ? { ...s, enabled: false } : s)),
    permissions: ["*"],
  });

  // Blogs и Categories ушли вместе с `content`; разделы `auth` остались.
  assert.deepEqual(keys, ["dashboard", "customers", "team", "settings", "licensing"]);
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

test("селектор сохраняет порядок и выбрасывает пустые группы", () => {
  const groups = [
    {
      label: "Overview",
      items: [{ title: "Dashboard", section: "dashboard" }],
    },
    {
      label: "Catalog",
      items: [{ title: "Categories", section: "categories" }],
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

test("быстрые действия недоступных разделов не отображаются", () => {
  const actions = [
    { title: "Invite teammate", section: "team" },
    { title: "Open licensing", section: "licensing" },
  ];

  assert.deepEqual(
    selectVisibleQuickActions(actions, ["dashboard", "team"]).map((action) => action.title),
    ["Invite teammate"],
  );
});

test("адрес раздела → ключ; удалённые и служебные адреса ключа не имеют", () => {
  assert.equal(sectionKeyOfPath("/admin"), "dashboard");
  assert.equal(sectionKeyOfPath("/admin/"), "dashboard");
  assert.equal(sectionKeyOfPath("/admin/blogs"), "blogs");
  assert.equal(sectionKeyOfPath("/admin/blogs/add"), "blogs");
  assert.equal(sectionKeyOfPath("/admin/products"), undefined);
  assert.equal(sectionKeyOfPath("/admin/orders"), undefined);
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
