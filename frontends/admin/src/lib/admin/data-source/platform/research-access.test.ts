import assert from "node:assert/strict";
import { test } from "node:test";

import {
  canGeneratePosts,
  canManageInstructs,
  canManageProject,
  canManageTopics,
  canRunResearch,
  hasPermission,
} from "./research-access.ts";

test("полный доступ покрывает все права разделов", () => {
  const all = ["*"];

  assert.equal(canManageProject(all), true);
  assert.equal(canRunResearch(all), true);
  assert.equal(canManageTopics(all), true);
  assert.equal(canManageInstructs(all), true);
  assert.equal(canGeneratePosts(all), true);
});

test("без права раздел остаётся только для чтения", () => {
  const viewOnly = ["content.research.view", "content.instructs.view", "auth.projects.view"];

  assert.equal(canManageProject(viewOnly), false);
  assert.equal(canRunResearch(viewOnly), false);
  assert.equal(canManageTopics(viewOnly), false);
  assert.equal(canManageInstructs(viewOnly), false);
  assert.equal(canGeneratePosts(viewOnly), false);
});

test("явное право включает своё действие и не включает чужие", () => {
  const runOnly = ["content.research.run"];

  assert.equal(canRunResearch(runOnly), true);
  assert.equal(canManageTopics(runOnly), false);
  assert.equal(canGeneratePosts(runOnly), false);
});

test("пустой и отсутствующий набор прав не даёт доступа", () => {
  assert.equal(hasPermission([], "content.research.run"), false);
  assert.equal(hasPermission(null, "content.research.run"), false);
  assert.equal(hasPermission(undefined, "content.research.run"), false);
});
