import assert from "node:assert/strict";
import { test } from "node:test";

import {
  TASK_POLL_MS,
  lastFailedTaskOf,
  runningTaskCount,
  runningTaskOf,
  taskPollInterval,
} from "./task-poll.ts";
import type { PlatformTask, PlatformTaskState } from "./tasks.ts";

function task(state: PlatformTaskState, id = 1): PlatformTask {
  return {
    id,
    kind: "post_generation",
    state,
    stage: null,
    subject_type: "topic",
    subject_id: "7",
    failure_reason: state === "failed" ? "Не удалось написать пост." : null,
    queued_at: "2026-08-30T10:00:00+00:00",
    started_at: state === "queued" ? null : "2026-08-30T10:00:01+00:00",
    finished_at: state === "succeeded" || state === "failed" ? "2026-08-30T10:01:00+00:00" : null,
  };
}

test("пустой список опрос не включает", () => {
  assert.equal(taskPollInterval([]), false);
  assert.equal(taskPollInterval(undefined), false);
});

test("выполняющаяся задача включает частый опрос", () => {
  assert.equal(taskPollInterval([task("running")]), TASK_POLL_MS);
  assert.equal(taskPollInterval([task("queued")]), TASK_POLL_MS);
});

test("только завершённые задачи опрос выключают", () => {
  assert.equal(taskPollInterval([task("succeeded"), task("failed", 2)]), false);
});

test("индикатор считает только работу: есть, нет, реестр недоступен", () => {
  assert.equal(runningTaskCount([task("running"), task("succeeded", 2)]), 1);
  assert.equal(runningTaskCount([task("succeeded")]), 0);
  assert.equal(runningTaskCount(undefined), 0);
});

test("занятость предмета определяется незавершённой задачей", () => {
  assert.equal(runningTaskOf([task("succeeded"), task("running", 2)])?.id, 2);
  assert.equal(runningTaskOf([task("succeeded")]), undefined);
});

test("отказ по предмету остаётся видимым", () => {
  assert.equal(lastFailedTaskOf([task("failed", 3)])?.id, 3);
  assert.equal(lastFailedTaskOf([task("succeeded")]), undefined);
});
