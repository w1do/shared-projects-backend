import { expect, test } from "@playwright/test";

import { operatorToken, setService, withServiceDisabled } from "../support/platform";
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
/** Порядок каталожный: Обзор → Каталог → Продажи → Рабочее пространство. */
const VISIBLE = [
  "Дашборд",
  "Категории",
  "Клиенты",
  "Лицензирование",
  "Блог",
  "Команда",
  "Настройки",
];

/** Разделы вёрстки без сервиса платформы — их не должно быть в меню. */
const HIDDEN = [
  "Товары",
  "Варианты",
  "Бренды",
  "Коллекции",
  "Склад",
  "Заказы",
  "Кампании",
  "Акции",
  "Поддержка",
  "Уведомления",
];

type Page = import("@playwright/test").Page;

/**
 * Группы навигации без блока быстрых действий: он тоже отрисован как
 * `data-sidebar="menu"`, а его пункты со ссылками попали бы в состав меню.
 */
function navGroups(page: Page) {
  return page
    .locator('[data-sidebar="group"]')
    .filter({ hasNot: page.getByText("Быстрые действия", { exact: true }) });
}

/** Пункты меню сайдбара: только навигация. */
function sidebarItems(page: Page) {
  return navGroups(page).locator('a[href^="/admin"]');
}

/** Названия пунктов меню — для сравнения состава целиком. */
async function sidebarTitles(page: Page): Promise<string[]> {
  const titles = (await sidebarItems(page).allInnerTexts()).map((t) => t.trim()).filter(Boolean);
  return [...new Set(titles)];
}

test.describe("состав меню", () => {
  test("супер-администратор видит только разделы с поддержкой платформы", async ({ page }) => {
    await page.goto("/admin");

    const items = sidebarItems(page);
    await expect(items.first()).toBeVisible();

    // Снимок разделов читается эффектом после гидрации: до него меню на миг
    // полное. Ждём устойчивого состояния, а не первого кадра.
    await expect
      .poll(() => sidebarTitles(page), { timeout: 10_000 })
      .toEqual(VISIBLE);

    const unique = await sidebarTitles(page);

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
      "Добавить товар",
      "Новая акция",
      "Импорт склада",
      "Создать коллекцию",
      "Запустить кампанию",
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
  test("выключение content убирает Блог и Категории после повторного входа", async ({
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

        expect(titles, "Блог ушёл вместе с сервисом content").not.toContain("Блог");
        expect(titles, "Категории ушли вместе с сервисом content").not.toContain("Категории");
        expect(titles, "разделы ядра остались").toContain("Настройки");

        await page.goto("/admin/blogs");
        await expect(page).toHaveURL(/\/admin\/unauthorized$/);
      } finally {
        await context.close();
      }
    });
  });
});

test.describe("переключение сервисов из консоли", () => {
  /** Переключатель сервиса на вкладке «Сервисы» настроек. */
  function serviceSwitch(page: Page, service: string) {
    return page
      .locator(`[data-testid=services-section] [data-service="${service}"]`)
      .getByRole("switch");
  }

  async function openServicesTab(page: Page) {
    await page.goto("/admin/settings");
    await page.getByRole("tab", { name: /Сервисы|Services/ }).click();
    await expect(page.locator("[data-testid=services-section]")).toBeVisible();
  }

  test("выключение content из UI сразу убирает разделы; галочка переживает перезагрузку", async ({
    page,
  }) => {
    const token = await operatorToken();
    const WITHOUT_CONTENT = [
      "Дашборд",
      "Клиенты",
      "Лицензирование",
      "Команда",
      "Настройки",
    ];

    try {
      await openServicesTab(page);

      const toggle = serviceSwitch(page, "content");
      await expect(toggle).toBeEnabled();
      await expect(toggle).toHaveAttribute("data-state", "checked");

      // Выключение отражается в меню сразу — без перезагрузки и повторного входа.
      await toggle.click();
      await expect.poll(() => sidebarTitles(page), { timeout: 10_000 }).toEqual(WITHOUT_CONTENT);

      // Состояние сохранено платформой: после перезагрузки галочка выключена.
      await page.reload();
      await page.getByRole("tab", { name: /Сервисы|Services/ }).click();
      await expect(serviceSwitch(page, "content")).toHaveAttribute("data-state", "unchecked");
      await expect.poll(() => sidebarTitles(page), { timeout: 10_000 }).toEqual(WITHOUT_CONTENT);

      // Включение возвращает разделы так же сразу.
      await serviceSwitch(page, "content").click();
      await expect.poll(() => sidebarTitles(page), { timeout: 10_000 }).toEqual(VISIBLE);
    } finally {
      // Страховка: упавший сценарий не должен оставить проект без content.
      await setService(token, "content", true);
    }
  });

  test("ядровой сервис auth не предлагается к выключению", async ({ page }) => {
    await openServicesTab(page);

    await expect(serviceSwitch(page, "content")).toBeVisible();
    await expect(
      page.locator('[data-testid=services-section] [data-service="auth"]'),
    ).toHaveCount(0);
  });
});
