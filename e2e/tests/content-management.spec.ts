import { expect, test, type Page } from "@playwright/test";

import {
  archivePostIfExists,
  categoryTree,
  createCategory,
  deleteCategoryIfExists,
  findCategory,
  postBySlug,
} from "../support/content";
import { operatorToken } from "../support/platform";

/**
 * Управление контентом: дерево категорий и жизненный цикл поста.
 *
 * Тестовые данные создаются под уникальными для прогона именами и убираются в
 * `finally`: категории — удалением (снимает поддерево), пост — архивом, потому
 * что удалять посты платформа не умеет. Прогоны не накапливают активных данных.
 */

const RUN = `e2e${String(Date.now() % 1_000_000)}`;

// Продакшен-сборка панели за gateway: сценарии из нескольких переходов и
// сохранений не укладываются в 30 секунд по умолчанию.
test.setTimeout(90_000);

/** Имена строк дерева в порядке отображения, с их уровнем. */
async function visibleTree(page: Page): Promise<string[]> {
  await expect(page.locator("[data-category-depth]").first()).toBeVisible();

  return page
    .locator("[data-category-depth]")
    .evaluateAll((rows) =>
      rows.map(
        (row) =>
          `${row.getAttribute("data-category-depth")}:${(row.textContent ?? "")
            .replace("└", "")
            .trim()}`,
      ),
    );
}

/**
 * Показать только строки этого прогона: поиск фильтрует по имени/слагу и
 * снимает зависимость от пагинации. Порядок строк остаётся префиксным.
 */
async function filterByRun(page: Page) {
  await page.getByPlaceholder(/Поиск категорий|Search categories/).fill(RUN);
  await page.waitForTimeout(600);
}

test.describe("дерево категорий", () => {
  test("создание корневой категории и подкатегории через форму", async ({ page }) => {
    const token = await operatorToken();
    const created: number[] = [];

    try {
      // Корневая — через форму
      await page.goto("/admin/categories/add");
      await page.locator("input[name=name]").fill(`Section ${RUN}`);
      await page.getByRole("button", { name: /Сохранить категорию|Save category/ }).last().click();
      await page.waitForURL("**/admin/categories");

      // Подкатегория — через форму, с выбором родителя
      await page.goto("/admin/categories/add");
      await page.locator("input[name=name]").fill(`Subsection ${RUN}`);
      await page.locator("[data-testid=category-parent]").click();
      await page
        .locator("[data-category-option]", { hasText: `Section ${RUN}` })
        .first()
        .click();
      await page.getByRole("button", { name: /Сохранить категорию|Save category/ }).last().click();
      await page.waitForURL("**/admin/categories");

      await filterByRun(page);
      const rows = await visibleTree(page);
      const rootIndex = rows.indexOf(`0:Section ${RUN}`);

      expect(rootIndex, "корневая категория видна на верхнем уровне").toBeGreaterThanOrEqual(0);
      expect(rows[rootIndex + 1], "подкатегория видна под родителем со сдвигом уровня").toBe(
        `1:Subsection ${RUN}`,
      );
    } finally {
      const tree = await categoryTree(token);
      const root = findCategory(tree, `Section ${RUN}`);
      if (root) created.push(root.id);
      for (const id of created) await deleteCategoryIfExists(token, id);
    }
  });

  test("перемещение узла с потомками к другому родителю и в корень", async ({ page }) => {
    const token = await operatorToken();
    const rootA = await createCategory(token, `BranchA ${RUN}`, `${RUN}-branch-a`);
    const rootB = await createCategory(token, `BranchB ${RUN}`, `${RUN}-branch-b`);
    const middle = await createCategory(token, `Middle ${RUN}`, `${RUN}-middle`, rootA);
    await createCategory(token, `Leaf ${RUN}`, `${RUN}-leaf`, middle);

    const moveTo = async (nodeName: string, parentLabel: string) => {
      const row = page.locator("tr", { hasText: nodeName }).first();
      await row.scrollIntoViewIfNeeded();
      await row.hover();
      // Меню строки поверх Radix-попперов открывается не с первого раза —
      // повторяем, пока пункт не станет видимым.
      const menuItem = page.getByText(/Переместить…|Move to…/);
      await expect(async () => {
        // Обычный клик: force после перерисовки списка промахивается мимо триггера.
        await row.locator("button").last().click({ timeout: 2000 });
        await expect(menuItem).toBeVisible({ timeout: 1500 });
      }).toPass({ timeout: 15_000 });
      await menuItem.click();
      const dialog = page.getByRole("dialog", { name: /Переместить категорию|Move category/ });
      await expect(dialog).toBeVisible();
      await dialog.locator("[data-testid=category-move-parent]").click();
      const optionLocator =
        parentLabel === "No parent (root)" || parentLabel === "Без родителя (корень)"
          ? page.locator('[data-category-option="__root__"]')
          : page.locator("[data-category-option]", { hasText: parentLabel });
      await optionLocator.first().click();
      await dialog.getByRole("button", { name: /Переместить категорию|Move category/ }).click();
      await expect(dialog).not.toBeVisible();
      await page.waitForTimeout(1000);
    };

    try {
      await page.goto("/admin/categories");
      await filterByRun(page);
      await visibleTree(page);

      // Узел с потомком — к другому родителю: потомок следует за ним
      await moveTo(`Middle ${RUN}`, `BranchB ${RUN}`);
      let rows = await visibleTree(page);
      let index = rows.indexOf(`1:Middle ${RUN}`);
      expect(index, "узел под новым родителем").toBeGreaterThan(rows.indexOf(`0:BranchB ${RUN}`));
      expect(rows[index + 1], "потомок остался потомком").toBe(`2:Leaf ${RUN}`);

      // И в корень
      await moveTo(`Middle ${RUN}`, "Без родителя (корень)");
      rows = await visibleTree(page);
      index = rows.indexOf(`0:Middle ${RUN}`);
      expect(index, "узел стал корневым").toBeGreaterThanOrEqual(0);
      expect(rows[index + 1], "поддерево сохранилось").toBe(`1:Leaf ${RUN}`);
    } finally {
      for (const id of [rootA, rootB, middle]) await deleteCategoryIfExists(token, id);
    }
  });

  test("цикл запрещён: свои потомки не предлагаются, отказ не меняет дерево", async ({ page }) => {
    const token = await operatorToken();
    const root = await createCategory(token, `Cycle ${RUN}`, `${RUN}-cycle`);
    await createCategory(token, `CycleChild ${RUN}`, `${RUN}-cycle-child`, root);

    try {
      await page.goto("/admin/categories");
      await filterByRun(page);
      await visibleTree(page);

      const row = page.locator("tr", { hasText: `Cycle ${RUN}` }).first();
      await row.scrollIntoViewIfNeeded();
      await row.locator("button").last().click();
      await page.getByText(/Переместить…|Move to…/).click();
      const dialog = page.getByRole("dialog", { name: /Переместить категорию|Move category/ });
      await dialog.locator("[data-testid=category-move-parent]").click();

      // Сам узел и его поддерево видны, но недоступны для выбора
      for (const name of [`Cycle ${RUN}`, `CycleChild ${RUN}`]) {
        const option = page.locator("[data-category-option]", { hasText: name }).first();
        await expect(option).toHaveAttribute("aria-disabled", "true");
      }

      // Закрыть выпадающий список и диалог полностью: висящий popper Radix
      // перехватывает клики по строкам таблицы.
      await page.keyboard.press("Escape");
      await dialog.getByRole("button", { name: /Отмена|Cancel/ }).click();
      await expect(dialog).not.toBeVisible();
      await expect(page.locator("[data-radix-popper-content-wrapper]")).toHaveCount(0);

      // Отказ платформы (дерево изменилось конкурентно) не меняет отображение
      const before = await visibleTree(page);
      await page.route("**/categories/*/move", (route) =>
        route.fulfill({
          status: 422,
          contentType: "application/json",
          body: JSON.stringify({
            error: { code: "validation_failed", message: "Cannot move into own subtree." },
          }),
        }),
      );
      const rowAgain = page.locator("tr", { hasText: `Cycle ${RUN}` }).first();
      await rowAgain.scrollIntoViewIfNeeded();
      await rowAgain.locator("button").last().click();
      await page.getByText(/Переместить…|Move to…/).click();
      await page
        .getByRole("dialog", { name: /Переместить категорию|Move category/ })
        .getByRole("button", { name: /Переместить категорию|Move category/ })
        .click();
      await expect(page.locator("[data-sonner-toast]").first()).toContainText("own subtree");
      await page.keyboard.press("Escape");
      await page.unroute("**/categories/*/move");

      expect(await visibleTree(page), "дерево не изменилось").toEqual(before);
    } finally {
      await deleteCategoryIfExists(token, root);
    }
  });
});

test.describe("жизненный цикл поста", () => {
  test("создание → категория → публикация → правка → восстановление ревизии", async ({ page }) => {
    const token = await operatorToken();
    const slug = `${RUN}-lifecycle-post`;
    const title = `Пост ${RUN}`;

    try {
      // Создание черновика с привязкой к категории проекта
      await page.goto("/admin/blogs/add");
      // slug генерируется из заголовка, поэтому заголовок латиницей
      await page.locator("input[name=title]").fill(`Post ${slug}`);
      await page.locator("textarea[name=subtitle]").fill("E2E lifecycle subtitle");
      // Содержимое — блоки «название + markdown»; автора форма не спрашивает
      await page.getByTestId("content-block-add").click();
      await page.getByTestId("content-block-title").first().fill("Вступление");
      await page.getByTestId("content-block-markdown").first().fill("Первый абзац тестового поста.");
      await page.locator("[data-testid=post-categories-select]").click();
      await page.locator("[data-category-option]", { hasText: /^Новости$/ }).first().click();
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Сохранить статью" }).last().click();
      await page.waitForURL("**/admin/blogs");

      const post = await postBySlug(token, `post-${slug}`);
      expect(post, "пост создан").toBeTruthy();
      expect(post.status, "создан черновиком, а не публикацией").toBe("draft");
      const news = findCategory(await categoryTree(token), "Новости");
      expect(post.categories, "категория привязана").toContain(news!.id);

      await page.goto(`/admin/blogs/post-${slug}/edit`);
      await expect(page.locator("[data-testid=post-status]")).toHaveText(/Черновик/);

      // Публикация
      await page.getByRole("button", { name: "Опубликовать", exact: true }).click();
      await expect(page.locator("[data-testid=post-status]")).toHaveText(/Опубликован/, {
        timeout: 10_000,
      });

      // Правка заголовка → новая ревизия. Сохранение уводит на список,
      // поэтому на страницу редактирования возвращаемся явно.
      await page.locator("input[name=title]").fill(`Post ${slug} v2`);
      await page.getByRole("button", { name: "Сохранить изменения" }).last().click();
      await page.waitForTimeout(2500);
      await page.goto(`/admin/blogs/post-${slug}/edit`);
      await expect
        .poll(async () => page.locator("[data-testid=post-revisions]").count(), {
          timeout: 15_000,
        })
        .toBeGreaterThan(0);

      // Восстановление прежней версии возвращает старый заголовок
      await page
        .locator("[data-testid=post-revisions]")
        .getByRole("button", { name: "Восстановить" })
        .last()
        .click();
      await page.waitForTimeout(2000);
      await page.goto(`/admin/blogs/post-${slug}/edit`);
      await page.waitForFunction(
        () => (document.querySelector("input[name=title]") as HTMLInputElement)?.value.length > 0,
      );
      const restored = await page.locator("input[name=title]").inputValue();
      expect(restored, "содержимое соответствует восстановленной версии").toBe(`Post ${slug}`);
    } finally {
      await archivePostIfExists(token, `post-${slug}`);
    }
  });
});
