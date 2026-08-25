import { expect, test } from "@playwright/test";

import { operatorToken, withServiceDisabled } from "../support/platform";
import { signIn } from "../support/session";
import { env } from "../support/env";

/**
 * Состав разделов панели: меню собирается из включённых сервисов проекта и прав
 * оператора, разделы без поддержки платформы скрыты, но сохранены в коде.
 *
 * Проверяется то, что видит оператор. Коды ответов и работу селектора отдельно
 * закрывают guard и юнит-тесты — здесь важно, что меню действительно собралось.
 */

/** Разделы, доступные супер-администратору проекта demo. */
/** Порядок каталожный: Overview → Catalog → Commerce → Workspace. */
const VISIBLE = ["Dashboard", "Categories", "Customers", "Blogs", "Team", "Settings"];

/** Разделы вёрстки без сервиса платформы — их не должно быть в меню. */
const HIDDEN = [
  "Products",
  "Variants",
  "Brands",
  "Collections",
  "Inventory",
  "Orders",
  "Campaigns",
  "Promotions",
  "Support",
  "Notifications",
];

type Page = import("@playwright/test").Page;

/**
 * Группы навигации без блока быстрых действий: он тоже отрисован как
 * `data-sidebar="menu"`, а его пункты со ссылками попали бы в состав меню.
 */
function navGroups(page: Page) {
  return page
    .locator('[data-sidebar="group"]')
    .filter({ hasNot: page.getByText("Quick Actions", { exact: true }) });
}

/** Пункты меню сайдбара: только навигация. */
function sidebarItems(page: Page) {
  return navGroups(page).locator('a[href^="/admin"]');
}

test.describe("состав меню", () => {
  test("супер-администратор видит только разделы с поддержкой платформы", async ({ page }) => {
    await page.goto("/admin");

    const items = sidebarItems(page);
    await expect(items.first()).toBeVisible();

    // Снимок разделов читается эффектом после гидрации: до него меню на миг
    // полное. Ждём устойчивого состояния, а не первого кадра.
    await expect
      .poll(async () => {
        const titles = (await items.allInnerTexts()).map((t) => t.trim()).filter(Boolean);
        return [...new Set(titles)];
      }, { timeout: 10_000 })
      .toEqual(VISIBLE);

    const unique = [...new Set((await items.allInnerTexts()).map((t) => t.trim()).filter(Boolean))];

    for (const hidden of HIDDEN) {
      expect(unique, `раздел ${hidden} скрыт`).not.toContain(hidden);
    }
  });

  test("группы без видимых пунктов не отображаются", async ({ page }) => {
    await page.goto("/admin");
    await expect(sidebarItems(page).first()).toBeVisible();

    const groups = navGroups(page).filter({
      has: page.locator('[data-sidebar="group-label"]'),
    });

    const count = await groups.count();
    expect(count, "группы навигации найдены").toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const group = groups.nth(i);
      const label = (await group.locator('[data-sidebar="group-label"]').first().innerText()).trim();
      const links = await group.locator('a[href^="/admin"]').count();

      expect(links, `группа «${label}» не отображается пустой`).toBeGreaterThan(0);
    }
  });

  test("быстрые действия скрытых разделов не предлагаются", async ({ page }) => {
    await page.goto("/admin");
    await expect(sidebarItems(page).first()).toBeVisible();

    const body = await page.locator('[data-sidebar="sidebar"]').first().innerText();

    for (const action of [
      "Add product",
      "New promotion",
      "Import inventory",
      "Create collection",
      "Launch campaign",
    ]) {
      expect(body, `действие «${action}» не предлагается`).not.toContain(action);
    }
  });
});

test.describe("доступ к маршрутам", () => {
  test("скрытый раздел по прямому адресу даёт отказ", async ({ page }) => {
    await page.goto("/admin/products");

    await expect(page).toHaveURL(/\/admin\/unauthorized$/);
  });

  test("доступный раздел открывается обычным образом", async ({ page }) => {
    await page.goto("/admin/blogs");

    await expect(page).toHaveURL(/\/admin\/blogs$/);
    await expect(page).not.toHaveURL(/unauthorized/);
  });
});

test.describe("реакция на состав сервисов проекта", () => {
  test("выключение content убирает Blogs и Categories после повторного входа", async ({
    browser,
  }) => {
    const token = await operatorToken();

    await withServiceDisabled(token, "content", async () => {
      // Чистый контекст: снимок разделов пишется при входе, поэтому нужен
      // именно повторный вход, а не перезагрузка страницы.
      // storageState задаётся явно пустым: контекст не должен унаследовать
      // сохранённый вход, иначе `/login` сразу уводит на `/admin`.
      const context = await browser.newContext({ baseURL: env.baseUrl, storageState: undefined });
      const page = await context.newPage();

      try {
        await signIn(page);

        const titles = (await sidebarItems(page).allInnerTexts()).map((t) => t.trim());

        expect(titles, "Blogs ушёл вместе с сервисом content").not.toContain("Blogs");
        expect(titles, "Categories ушёл вместе с сервисом content").not.toContain("Categories");
        expect(titles, "разделы ядра остались").toContain("Settings");

        await page.goto("/admin/blogs");
        await expect(page).toHaveURL(/\/admin\/unauthorized$/);
      } finally {
        await context.close();
      }
    });
  });
});
