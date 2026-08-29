import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PROJECT_EVENTS_LIMIT,
  mapProjectEvent,
  mapProjectEvents,
} from "./project-events.ts";

const entry = (
  id: number,
  createdAt: string | null,
  action = "post.published",
) => ({
  id,
  actor_type: "admin",
  actor_id: "1",
  action,
  subject: `post:${id}`,
  created_at: createdAt,
});

test("запись журнала приводится к событию панели", () => {
  assert.deepEqual(mapProjectEvent(entry(7, "2026-08-29T10:00:00+00:00")), {
    id: "7",
    action: "post.published",
    subject: "post:7",
    actor: "1",
    createdAt: "2026-08-29T10:00:00+00:00",
  });
});

test("пустые предмет и актор становятся null, а не пустой строкой", () => {
  const mapped = mapProjectEvent({
    id: 1,
    action: " project.created ",
    subject: "  ",
    actor_id: "",
  });

  assert.equal(mapped.subject, null);
  assert.equal(mapped.actor, null);
  assert.equal(mapped.action, "project.created");
});

test("события идут от свежих к старым и обрезаются по пределу", () => {
  const entries = [
    entry(1, "2026-08-01T00:00:00+00:00"),
    entry(3, "2026-08-03T00:00:00+00:00"),
    entry(2, "2026-08-02T00:00:00+00:00"),
  ];

  assert.deepEqual(
    mapProjectEvents(entries).map((event) => event.id),
    ["3", "2", "1"],
  );
  assert.deepEqual(
    mapProjectEvents(entries, 2).map((event) => event.id),
    ["3", "2"],
  );
});

test("предел по умолчанию — последние десять событий", () => {
  const many = Array.from({ length: 25 }, (_, index) =>
    entry(
      index + 1,
      `2026-08-${String((index % 28) + 1).padStart(2, "0")}T00:00:00+00:00`,
    ),
  );

  assert.equal(PROJECT_EVENTS_LIMIT, 10);
  assert.equal(mapProjectEvents(many).length, 10);
});

test("пустой журнал и ответ не-массивом дают пустой список", () => {
  assert.deepEqual(mapProjectEvents([]), []);
  assert.deepEqual(mapProjectEvents(null), []);
  assert.deepEqual(mapProjectEvents(undefined), []);
  assert.deepEqual(mapProjectEvents({ error: "forbidden" }), []);
});

test("записи без времени не роняют сортировку", () => {
  const mapped = mapProjectEvents([
    entry(1, null),
    entry(2, "2026-08-02T00:00:00+00:00"),
  ]);

  assert.deepEqual(
    mapped.map((event) => event.id),
    ["2", "1"],
  );
});
