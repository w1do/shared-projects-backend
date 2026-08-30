import assert from "node:assert/strict";
import { test } from "node:test";

import {
  canManageMembers,
  canManageRoles,
  canViewRoles,
  catalogWithRolePermissions,
  groupPermissions,
} from "./team-access.ts";

test("полный доступ проходит любую проверку раздела", () => {
  assert.equal(canViewRoles(["*"]), true);
  assert.equal(canManageRoles(["*"]), true);
  assert.equal(canManageMembers(["*"]), true);
});

test("без права ролей вкладка ролей закрыта, участники остаются", () => {
  const permissions = ["auth.members.view", "auth.members.manage"];

  assert.equal(canViewRoles(permissions), false);
  assert.equal(canManageRoles(permissions), false);
  assert.equal(canManageMembers(permissions), true);
});

test("просмотр ролей без управления не открывает правку", () => {
  assert.equal(canViewRoles(["auth.roles.view"]), true);
  assert.equal(canManageRoles(["auth.roles.view"]), false);
});

test("каталог группируется в порядке прихода, без группы — по сервису", () => {
  const groups = groupPermissions([
    {
      key: "auth.roles.view",
      label: "Просмотр ролей",
      group: "roles",
      service: "auth",
    },
    {
      key: "auth.roles.manage",
      label: "Управление ролями",
      group: "roles",
      service: "auth",
    },
    {
      key: "pay.plans.view",
      label: "Просмотр планов",
      group: null,
      service: "pay",
    },
  ]);

  assert.deepEqual(
    groups.map((group) => group.key),
    ["auth.roles", "pay.pay"],
  );
  assert.deepEqual(
    groups[0].permissions.map((permission) => permission.key),
    ["auth.roles.view", "auth.roles.manage"],
  );
});

test("одноимённые группы разных сервисов не слипаются", () => {
  const groups = groupPermissions([
    {
      key: "auth.settings.view",
      label: "Просмотр настроек",
      group: "settings",
      service: "auth",
    },
    {
      key: "pay.settings.view",
      label: "Настройки платежей",
      group: "settings",
      service: "pay",
    },
  ]);

  assert.deepEqual(
    groups.map((group) => group.key),
    ["auth.settings", "pay.settings"],
  );
});

test("право роли вне каталога остаётся в диалоге своим ключом", () => {
  const catalog = groupPermissions([
    {
      key: "auth.roles.view",
      label: "Просмотр ролей",
      group: "roles",
      service: "auth",
    },
  ]);

  const groups = catalogWithRolePermissions(catalog, [
    "auth.roles.view",
    "pay.plans.view",
  ]);

  assert.deepEqual(
    groups.map((group) => group.key),
    ["auth.roles", "pay.plans"],
  );
  assert.deepEqual(groups[1].permissions, [
    { key: "pay.plans.view", label: "pay.plans.view" },
  ]);
  // Каталог не мутируется: список групп собирается заново.
  assert.equal(catalog.length, 1);
});
