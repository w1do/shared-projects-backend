import { expect, test, type Page } from "@playwright/test";

import { operatorToken } from "../support/platform";
import { signIn } from "../support/session";
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
  await page.getByRole("tab", { name: /Языки|Languages/ }).click();
  await expect(page.locator("[data-testid=languages-section]")).toBeVisible();
}

async function deleteTranslationByKey(token: string, key: string) {
  const base = `${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/content/translations`;
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/json" };
  const list = await (await fetch(base, { headers })).json();
  const row = (list.data ?? []).find((item: { key: string }) => item.key === key);
  if (row) await fetch(`${base}/${row.id}`, { method: "DELETE", headers });
}

test("каркас консоли на русском: сайдбар и экран входа", async ({ page, browser }) => {
  // Сайдбар авторизованного оператора — русские пункты живых разделов.
  await page.goto("/admin");
  await expect(page.getByRole("link", { name: "Дашборд" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Настройки" }).first()).toBeVisible();

  // Дашборд собран из реальных секций с русскими заголовками; демо-секции шаблона не рендерятся.
  await expect(page.getByRole("heading", { name: "Обзор выручки" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole("heading", { name: "Свежие материалы" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Топ страниц" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent orders" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Best sellers" })).toHaveCount(0);

  // Экран входа — чистый контекст без сохранённой сессии. storageState задаётся
  // явно пустым: контекст не должен унаследовать сохранённый вход из конфига,
  // иначе `/login` сразу уводит на `/admin`.
  const anonymous = await browser.newContext({ baseURL: env.baseUrl, storageState: undefined });
  const loginPage = await anonymous.newPage();
  try {
    await loginPage.goto("/login");
    await expect(loginPage.getByRole("heading", { name: "Вход в консоль" })).toBeVisible();
    await expect(loginPage.getByRole("button", { name: "Войти" })).toBeVisible();
  } finally {
    await anonymous.close();
  }
});

test("ключ console.* из словаря переопределяет текст консоли, удаление возвращает дефолт", async ({
  browser,
}) => {
  const token = await operatorToken();
  const key = "console.nav.settings";
  const value = `Параметры ${RUN}`;
  const base = `${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/content/translations`;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  /** Переопределения подтягиваются при входе: чистый контекст → повторный вход. */
  async function withFreshSession(action: (page: Page) => Promise<void>) {
    const context = await browser.newContext({ baseURL: env.baseUrl, storageState: undefined });
    try {
      const page = await context.newPage();
      await signIn(page);
      await action(page);
    } finally {
      await context.close();
    }
  }

  try {
    const created = await fetch(base, {
      method: "POST",
      headers,
      body: JSON.stringify({ key, values: { ru: value } }),
    });
    expect(created.ok, "ключ console.* добавлен в словарь проекта").toBeTruthy();

    await withFreshSession(async (page) => {
      const sidebar = page.locator('[data-sidebar="sidebar"]').first();
      await expect(sidebar.getByRole("link", { name: value })).toBeVisible({ timeout: 15_000 });
      await expect(sidebar.getByRole("link", { name: "Настройки", exact: true })).toHaveCount(0);
    });

    await deleteTranslationByKey(token, key);

    await withFreshSession(async (page) => {
      const sidebar = page.locator('[data-sidebar="sidebar"]').first();
      await expect(sidebar.getByRole("link", { name: "Настройки" })).toBeVisible({
        timeout: 15_000,
      });
    });
  } finally {
    await deleteTranslationByKey(token, key);
  }
});

test("локали проекта видны, первая помечена default", async ({ page }) => {
  await openLanguages(page);

  const list = page.locator("[data-testid=locale-list]");
  await expect(list).toContainText("ru");
  await expect(list).toContainText(/основная|default/);
});

test("ключ словаря создаётся, правится и помечается после автоперевода", async ({ page }) => {
  const token = await operatorToken();
  const key = `e2e.${RUN}`;

  try {
    await openLanguages(page);

    // создание
    await page.locator("[data-testid=dictionary-new-key]").fill(key);
    await page.getByRole("button", { name: /Добавить ключ|Add key/ }).click();
    const row = page.locator(`[data-translation-key="${key}"]`);
    await expect(row).toBeVisible();

    // правка ru-значения
    await row.getByLabel(`${key} ru`).fill(`Значение ${RUN}`);
    await row.getByRole("button", { name: /Сохранить|Save/ }).click();
    await expect(page.locator("[data-sonner-toast]").first()).toContainText(
      /сохранён|saved/,
    );

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
    await page.getByRole("tab", { name: /Языки|Languages/ }).click();
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
  await expect(page.locator("[data-sonner-toast]").first()).toContainText(
    /очередь|queued/,
  );
});

test("имя категории вводится по локалям, обе читаются обратно", async ({ page }) => {
  const token = await operatorToken();
  const slug = `${RUN}-bilingual`;

  try {
    await page.goto("/admin/categories/add");
    await page.locator("input[name=name]").fill(`Bilingual ${RUN}`);
    await expect(page.locator("[data-testid=category-name-en]")).toBeVisible();
    await page.locator("[data-testid=category-name-en]").fill(`English ${RUN}`);
    await page.getByRole("button", { name: "Сохранить категорию" }).last().click();
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
