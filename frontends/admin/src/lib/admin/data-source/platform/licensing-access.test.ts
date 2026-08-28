import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LICENSING_MANAGE_PERMISSION,
  LICENSING_VIEW_PERMISSION,
  canManageLicensing,
} from "./licensing-access.ts";

test("manage открывается явным правом или полным доступом", () => {
  assert.equal(canManageLicensing(["*"]), true);
  assert.equal(canManageLicensing([LICENSING_MANAGE_PERMISSION]), true);
  assert.equal(
    canManageLicensing([LICENSING_VIEW_PERMISSION, LICENSING_MANAGE_PERMISSION]),
    true,
  );
});

test("view без manage — только чтение", () => {
  assert.equal(canManageLicensing([LICENSING_VIEW_PERMISSION]), false);
  assert.equal(canManageLicensing([]), false);
  assert.equal(canManageLicensing(null), false);
  assert.equal(canManageLicensing(undefined), false);
});

test("имена прав — из группы licensing PayManifest, без переименований", () => {
  assert.equal(LICENSING_VIEW_PERMISSION, "pay.licensing.view");
  assert.equal(LICENSING_MANAGE_PERMISSION, "pay.licensing.manage");
});
