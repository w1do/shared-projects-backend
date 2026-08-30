import assert from "node:assert/strict";
import { test } from "node:test";

import {
  payBaseFor,
  paymentConfirmPath,
  paymentProviderPath,
  paymentProvidersPath,
  paymentRefundPath,
  paymentsPath,
  planArchivePath,
  plansPath,
  subscriptionActionPath,
  subscriptionsPath,
} from "./pay-paths.ts";

test("пути провайдеров строятся от {project}-плейсхолдера текущего проекта", () => {
  assert.equal(
    paymentProvidersPath(),
    "/api/admin/v1/projects/{project}/pay/providers",
  );
  assert.equal(
    paymentProviderPath("platega"),
    "/api/admin/v1/projects/{project}/pay/providers/platega",
  );
});

test("явный ключ проекта-источника минует подстановку из cookie", () => {
  assert.equal(payBaseFor("demo"), "/api/admin/v1/projects/demo/pay");
  assert.equal(
    paymentProviderPath("platega", "demo"),
    "/api/admin/v1/projects/demo/pay/providers/platega",
  );
});

test("ключ проекта и провайдер экранируются в пути", () => {
  assert.equal(
    paymentProviderPath("plat ega", "pro/ject"),
    "/api/admin/v1/projects/pro%2Fject/pay/providers/plat%20ega",
  );
});

test("пути списков оплаты несут отбор и курсор", () => {
  assert.equal(paymentsPath(), "/api/admin/v1/projects/{project}/pay/payments");
  assert.equal(
    paymentsPath({ status: "succeeded", cursor: "abc" }),
    "/api/admin/v1/projects/{project}/pay/payments?status=succeeded&cursor=abc",
  );
  assert.equal(
    subscriptionsPath({ subjectType: "license_plan" }),
    "/api/admin/v1/projects/{project}/pay/subscriptions?subject_type=license_plan",
  );
  assert.equal(plansPath(), "/api/admin/v1/projects/{project}/pay/plans");
});

test("действия над платежом и подпиской адресуются по идентификатору", () => {
  assert.equal(
    paymentConfirmPath("pay-1"),
    "/api/admin/v1/projects/{project}/pay/payments/pay-1/confirm",
  );
  assert.equal(
    paymentRefundPath("pay-1"),
    "/api/admin/v1/projects/{project}/pay/payments/pay-1/refund",
  );
  assert.equal(
    subscriptionActionPath("sub-1", "cancel"),
    "/api/admin/v1/projects/{project}/pay/subscriptions/sub-1/cancel",
  );
  assert.equal(
    planArchivePath(7),
    "/api/admin/v1/projects/{project}/pay/plans/7/archive",
  );
});
