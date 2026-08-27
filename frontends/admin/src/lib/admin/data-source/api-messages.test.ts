import assert from "node:assert/strict";
import { test } from "node:test";

import { CONSOLE_TEXTS, clearConsoleTextOverrides } from "../console-texts.ts";
import { messageFor } from "./api-messages.ts";

clearConsoleTextOverrides();

test("текст платформы имеет приоритет над статусом", () => {
  assert.equal(messageFor(422, "Слаг уже занят"), "Слаг уже занят");
});

test("известные статусы отдают русские тексты реестра", () => {
  assert.equal(
    messageFor(403, undefined),
    CONSOLE_TEXTS["console.api.forbidden"],
  );
  assert.equal(messageFor(404, null), CONSOLE_TEXTS["console.api.not-found"]);
  assert.equal(messageFor(422, ""), CONSOLE_TEXTS["console.api.invalid"]);
});

test("прочие статусы подставляются в общий текст ошибки", () => {
  assert.equal(messageFor(500, undefined), "Запрос завершился ошибкой 500.");
});
