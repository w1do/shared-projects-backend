import assert from "node:assert/strict";
import { test } from "node:test";

import { PAY_PERMISSIONS, hasPayPermission } from "./pay-access.ts";

test("полный доступ открывает все действия оплаты", () => {
  for (const permission of Object.values(PAY_PERMISSIONS)) {
    assert.equal(hasPayPermission(["*"], permission), true);
  }
});

test("без права действие недоступно, чужое право не помогает", () => {
  assert.equal(
    hasPayPermission(["pay.payments.view"], PAY_PERMISSIONS.paymentsRefund),
    false,
  );
  assert.equal(
    hasPayPermission(
      [PAY_PERMISSIONS.paymentsRefund],
      PAY_PERMISSIONS.paymentsRefund,
    ),
    true,
  );
});

test("отсутствующий список прав равен пустому", () => {
  assert.equal(hasPayPermission(undefined, PAY_PERMISSIONS.plansManage), false);
  assert.equal(hasPayPermission(null, PAY_PERMISSIONS.plansManage), false);
});
