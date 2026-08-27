import assert from "node:assert/strict";
import { test } from "node:test";

import { projectUserToCustomer } from "./mappers.ts";

const USER = {
  id: 7,
  name: "Анна",
  email: "anna@example.com",
  project_id: "demo",
  blocked: false,
};

test("пользователь платформы → клиент вёрстки без выдуманного уровня лояльности", () => {
  const customer = projectUserToCustomer(USER);

  assert.equal(customer.id, "7");
  assert.equal(customer.name, "Анна");
  assert.equal(customer.email, "anna@example.com");
  assert.equal(customer.status, "Active");
  assert.equal(customer.tier, undefined, "tier не назначается — платформа лояльность не ведёт");
});

test("blocked → Inactive; имя падает обратно на email", () => {
  const customer = projectUserToCustomer({ ...USER, name: null, blocked: true });

  assert.equal(customer.status, "Inactive");
  assert.equal(customer.name, "anna@example.com");
});
