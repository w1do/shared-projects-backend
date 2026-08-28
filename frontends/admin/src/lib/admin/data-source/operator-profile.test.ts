import assert from "node:assert/strict";
import { test } from "node:test";

import { toOperatorProfile } from "./operator-profile.ts";

const PLATFORM_ADMIN = {
  id: 7,
  name: "Оператор",
  email: "operator@example.com",
  locale: "ru",
  is_super_admin: false,
};

test("профиль bootstrap → профиль оператора с локалью", () => {
  const profile = toOperatorProfile(PLATFORM_ADMIN);

  assert.equal(profile.id, "7");
  assert.equal(profile.email, "operator@example.com");
  assert.equal(profile.role, "manager");
  assert.equal(profile.locale, "ru");
});

test("локаль оператора приходит из платформы как есть", () => {
  assert.equal(
    toOperatorProfile({ ...PLATFORM_ADMIN, locale: "en" }).locale,
    "en",
  );
});

test("пустая локаль платформы откатывается на русскую", () => {
  assert.equal(
    toOperatorProfile({ ...PLATFORM_ADMIN, locale: "" }).locale,
    "ru",
  );
});

test("супер-администратор получает роль admin", () => {
  const profile = toOperatorProfile({
    ...PLATFORM_ADMIN,
    is_super_admin: true,
  });

  assert.equal(profile.role, "admin");
  assert.equal(profile.position, "Super admin");
});
