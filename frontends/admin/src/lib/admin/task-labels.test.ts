import assert from "node:assert/strict";
import { test } from "node:test";

import {
  taskKindLabel,
  taskStageLabel,
  taskStateLabel,
  taskSubjectLabel,
} from "./task-labels.ts";
import type { PlatformTask } from "./data-source/platform/tasks.ts";

const task: PlatformTask = {
  id: 1,
  kind: "post_generation",
  state: "running",
  stage: "ai_request",
  subject_type: "topic",
  subject_id: "7",
  failure_reason: null,
  queued_at: null,
  started_at: null,
  finished_at: null,
};

test("вид работы, состояние и этап показываются по-русски", () => {
  assert.equal(taskKindLabel(task.kind), "Написание поста");
  assert.equal(taskStateLabel(task.state), "Выполняется");
  assert.equal(taskStageLabel(task.stage), "Запрос к ИИ");
});

test("незнакомый ключ платформы показывается как есть", () => {
  assert.equal(taskKindLabel("brand_new_kind"), "brand_new_kind");
  assert.equal(taskStageLabel("brand_new_stage"), "brand_new_stage");
});

test("предмет работы собирается из вида и идентификатора", () => {
  assert.equal(taskSubjectLabel(task), "Тема 7");
  assert.equal(taskSubjectLabel({ ...task, subject_id: null }), "Тема");
  assert.equal(taskSubjectLabel({ ...task, subject_type: null }), "—");
});

test("этап отсутствует — подписи нет", () => {
  assert.equal(taskStageLabel(null), null);
});
