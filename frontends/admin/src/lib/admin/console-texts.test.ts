import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import {
  CONSOLE_TEXTS,
  applyConsoleTextOverrides,
  clearConsoleTextOverrides,
  consoleTextsRevision,
  refreshConsoleTexts,
  subscribeConsoleTexts,
  t,
  tf,
} from "./console-texts.ts";

/** Термины, у которых нет русского написания, — единственные допустимые без кириллицы. */
const LATIN_ONLY_TERMS = new Set([
  "Email",
  "Push",
  "URL",
  "SEO",
  "API",
  "ID",
  "Slug",
  "Uptime SLA",
  "JSON",
]);

beforeEach(() => {
  clearConsoleTextOverrides();
});

test("каждый ключ реестра — console.* с непустым русским значением", () => {
  const entries = Object.entries(CONSOLE_TEXTS);
  assert.ok(entries.length > 0);

  for (const [key, value] of entries) {
    assert.ok(
      key.startsWith("console."),
      `ключ вне пространства console.*: ${key}`,
    );
    assert.ok(value.trim().length > 0, `пустое значение по умолчанию: ${key}`);
    assert.ok(
      /[А-Яа-яЁё]/.test(value) || LATIN_ONLY_TERMS.has(value),
      `значение по умолчанию не на русском: ${key} = ${value}`,
    );
  }
});

test("без переопределений t() отдаёт значение по умолчанию", () => {
  assert.equal(
    t("console.common.cancel"),
    CONSOLE_TEXTS["console.common.cancel"],
  );
});

test("переопределение из словаря применяется и снимается", () => {
  applyConsoleTextOverrides({ "console.common.cancel": "Cancel" });
  assert.equal(t("console.common.cancel"), "Cancel");

  // Ключ ушёл из словаря — вернулось значение по умолчанию, не пустая строка.
  applyConsoleTextOverrides({});
  assert.equal(
    t("console.common.cancel"),
    CONSOLE_TEXTS["console.common.cancel"],
  );
});

test("не-console ключи и пустые значения словаря отбрасываются", () => {
  applyConsoleTextOverrides({
    "site.header.title": "Магазин",
    "console.common.save": "   ",
    "console.common.delete": 42,
    "console.common.edit": "Править",
  });

  assert.equal(t("console.common.save"), CONSOLE_TEXTS["console.common.save"]);
  assert.equal(
    t("console.common.delete"),
    CONSOLE_TEXTS["console.common.delete"],
  );
  assert.equal(t("console.common.edit"), "Править");
});

test("неизвестный ключ не компилируется, в рантайме возвращается как есть", () => {
  // @ts-expect-error — ключа нет в реестре: типизация запрещает такой вызов.
  assert.equal(t("console.unknown.key"), "console.unknown.key");
});

test("tf() подставляет параметры, неизвестные плейсхолдеры не трогает", () => {
  applyConsoleTextOverrides({
    "console.login.welcome": "Привет, {name}! Осталось {left}.",
  });
  assert.equal(
    tf("console.login.welcome", { name: "Ада" }),
    "Привет, Ада! Осталось {left}.",
  );
});

test("refreshConsoleTexts накладывает словарь проекта поверх реестра", async () => {
  await refreshConsoleTexts({ locale: "ru", version: "3" }, async () => ({
    "console.common.cancel": "Отменить всё",
    "site.header.title": "Не для консоли",
  }));

  assert.equal(t("console.common.cancel"), "Отменить всё");
  assert.equal(t("console.common.save"), CONSOLE_TEXTS["console.common.save"]);
});

test("сбой запроса словаря не ломает t(): остаются значения по умолчанию", async () => {
  await refreshConsoleTexts({ locale: "ru", version: "3" }, async () => {
    throw new Error("content выключен");
  });

  assert.equal(
    t("console.common.cancel"),
    CONSOLE_TEXTS["console.common.cancel"],
  );
});

test("пустой ответ словаря равен отсутствию переопределений", async () => {
  applyConsoleTextOverrides({ "console.common.cancel": "Cancel" });
  await refreshConsoleTexts({ locale: "ru", version: "4" }, async () => null);

  assert.equal(
    t("console.common.cancel"),
    CONSOLE_TEXTS["console.common.cancel"],
  );
});

test("подписчики уведомляются о смене переопределений", () => {
  let notified = 0;
  const unsubscribe = subscribeConsoleTexts(() => {
    notified += 1;
  });

  const before = consoleTextsRevision();
  applyConsoleTextOverrides({ "console.common.cancel": "Cancel" });
  assert.equal(notified, 1);
  assert.ok(consoleTextsRevision() > before);

  unsubscribe();
  clearConsoleTextOverrides();
  assert.equal(notified, 1);
});
