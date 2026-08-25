import { expect, test, type Page } from "@playwright/test";

import { operatorToken } from "../support/platform";
import { env } from "../support/env";

/**
 * Управление локализацией из панели: локали проекта, словарь переводов,
 * автоперевод (замокан — сети к AI-провайдеру в тестах нет), имя категории
 * по локалям. Тестовые ключи уникальны для прогона и убираются в finally.
 */

const RUN = `l10n${String(Date.now() % 1_000_000)}`;

test.setTimeout(90_000);

async function openLanguages(page: Page) {
  await page.goto("/admin/settings");
  await page.getByRole("tab", { name: "Languages" }).click();
  await expect(page.locator("[data-testid=languages-section]")).toBeVisible();
}

async function deleteTranslationByKey(token: string, key: string) {
  const base = `${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/content/translations`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
  const list = await (await fetch(base, { headers })).json();
  const row = (list.data ?? []).find((item: { key: string }) => item.key === key);
  if (row) await fetch(`${base}/${row.id}`, { method: "DELETE", headers });
}

test("локали проекта видны, первая помечена default", async ({ page }) => {
  await openLanguages(page);

  const list = page.locator("[data-testid=locale-list]");
  await expect(list).toContainText("ru");
  await expect(list).toContainText("default");
});

test("ключ словаря создаётся, правится и помечается после автоперевода", async ({ page }) => {
  const token = await operatorToken();
  const key = `e2e.${RUN}`;

  try {
    await openLanguages(page);

    // создание
    await page.locator("[data-testid=dictionary-new-key]").fill(key);
    await page.getByRole("button", { name: "Add key" }).click();
    const row = page.locator(`[data-translation-key="${key}"]`);
    await expect(row).toBeVisible();

    // правка ru-значения
    await row.getByLabel(`${key} ru`).fill(`Значение ${RUN}`);
    await row.getByRole("button", { name: "Save" }).click();
    await expect(page.locator("[data-sonner-toast]").first()).toContainText("saved");

    // «автоперевод» приходит с бекенда с пометкой machine — эмулируем ответ API
    await page.route("**/content/translations", (route) =>
      route.request().method() === "GET"
        ? route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              data: [
                {
                  id: 1,
                  key,
                  values: { ru: `Значение ${RUN}`, en: "Machine value" },
                  machine: { en: true },
                },
              ],
            }),
          })
        : route.fallback(),
    );
    await page.reload();
    await page.getByRole("tab", { name: "Languages" }).click();
    await expect(
      page.locator(`[data-translation-key="${key}"] [data-testid=machine-badge]`),
    ).toBeVisible();
    await page.unroute("**/content/translations");
  } finally {
    await deleteTranslationByKey(token, key);
  }
});

test("Translate missing ставит фоновую задачу", async ({ page }) => {
  await openLanguages(page);

  // сети к AI нет: мокаем постановку
  await page.route("**/translate-missing", (route) =>
    route.fulfill({ status: 202, contentType: "application/json", body: "{}" }),
  );
  await page.locator("[data-testid=translate-missing]").click();
  await expect(page.locator("[data-sonner-toast]").first()).toContainText("queued");
});

test("имя категории вводится по локалям, обе читаются обратно", async ({ page }) => {
  const token = await operatorToken();
  const slug = `${RUN}-bilingual`;

  try {
    await page.goto("/admin/categories/add");
    await page.locator("input[name=name]").fill(`Bilingual ${RUN}`);
    await expect(page.locator("[data-testid=category-name-en]")).toBeVisible();
    await page.locator("[data-testid=category-name-en]").fill(`English ${RUN}`);
    await page.getByRole("button", { name: "Save category" }).last().click();
    await page.waitForURL("**/admin/categories");

    const base = `${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/content/categories`;
    const tree = await (
      await fetch(base, { headers: { Authorization: `Bearer ${token}` } })
    ).json();
    const find = (nodes: any[]): any =>
      nodes.reduce(
        (found, node) => found ?? (node.name_translations?.ru === `Bilingual ${RUN}` ? node : find(node.children ?? [])),
        null,
      );
    const created = find(tree.data);

    expect(created, "категория создана").toBeTruthy();
    expect(created.name_translations).toEqual({
      ru: `Bilingual ${RUN}`,
      en: `English ${RUN}`,
    });
  } finally {
    const base = `${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/content/categories`;
    const tree = await (
      await fetch(base, { headers: { Authorization: `Bearer ${token}` } })
    ).json();
    const flat = (nodes: any[]): any[] => nodes.flatMap((n) => [n, ...flat(n.children ?? [])]);
    const created = flat(tree.data).find((n) => n.name_translations?.ru === `Bilingual ${RUN}`);
    if (created) {
      await fetch(`${base}/${created.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  }
});
