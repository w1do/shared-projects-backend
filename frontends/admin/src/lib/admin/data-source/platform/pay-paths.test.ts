import assert from "node:assert/strict";
import { test } from "node:test";

import {
  payBaseFor,
  paymentProviderPath,
  paymentProvidersPath,
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
