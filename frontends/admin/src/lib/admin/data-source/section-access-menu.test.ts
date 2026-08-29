import assert from "node:assert/strict";
import { test } from "node:test";

import {
  decodeSectionSnapshot,
  persistSectionSnapshot,
  sectionKeyOfPath,
  sectionSnapshotRevision,
  selectVisibleQuickActions,
  selectVisibleSections,
  subscribeSectionSnapshot,
} from "./section-access.ts";

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
  const visible = selectVisibleSections(groups, [
    "dashboard",
    "team",
    "settings",
  ]);

  assert.deepEqual(
    visible.map((group) => [
      group.label,
      group.items.map((item) => item.title),
    ]),
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
    selectVisibleQuickActions(actions, ["dashboard", "team"]).map(
      (action) => action.title,
    ),
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
  assert.deepEqual(decodeSectionSnapshot("dashboard,blogs"), [
    "dashboard",
    "blogs",
  ]);
});
