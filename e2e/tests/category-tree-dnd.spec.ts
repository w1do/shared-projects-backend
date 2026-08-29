import { expect, test, type Locator, type Page } from "@playwright/test";

import { categoryTree, createCategory, deleteCategoryIfExists, findCategory } from "../support/content";
import { operatorToken } from "../support/platform";

/**
 * Перетаскивание в дереве категорий (TreeTable) и селект категорий с деревом.
 *
 * Нативный HTML5 DnD в Playwright надёжен через `dragTo` — при условии, что
 * строка-источник прокручена в кадр и страница устоялась; сырые mouse-события
 * dragstart не порождают.
 *
 * Тестовые узлы — под уникальными именами прогона, уборка в `finally`.
 */

const RUN = `dnd${String(Date.now() % 1_000_000)}`;

test.setTimeout(90_000);

function row(page: Page, name: string): Locator {
  return page.locator("[data-tree-node]", { hasText: name }).first();
}

async function drag(page: Page, source: string, target: string, y: number) {
  const src = row(page, source);
  await src.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await src.dragTo(row(page, target), { targetPosition: { x: 200, y } });
  await page.waitForTimeout(1800);
}

/** Порядок и уровень видимых строк дерева. */
async function visibleTree(page: Page): Promise<string[]> {
  await expect(page.locator("[data-tree-node]").first()).toBeVisible();

  return page
    .locator("[data-tree-node]")
    .evaluateAll((rows) =>
      rows.map(
        (node) =>
          `${node.getAttribute("data-tree-depth")}:${(
            node.querySelector("[data-category-depth]")?.textContent ?? ""
          ).trim()}`,
      ),
    );
}

test.describe("перетаскивание в дереве категорий", () => {
  test("бросок на строку вкладывает узел вместе с поддеревом", async ({ page }) => {
    const token = await operatorToken();
    const rootA = await createCategory(token, `DndA ${RUN}`, `${RUN}-a`);
    const rootB = await createCategory(token, `DndB ${RUN}`, `${RUN}-b`);
    const child = await createCategory(token, `DndChild ${RUN}`, `${RUN}-child`, rootA);
    await createCategory(token, `DndGrand ${RUN}`, `${RUN}-grand`, child);

    try {
      await page.goto("/admin/categories");
      // середина строки — зона вложения
      await drag(page, `DndA ${RUN}`, `DndB ${RUN}`, 24);

      const rows = await visibleTree(page);
      const parentIndex = rows.indexOf(`0:DndB ${RUN}`);
      expect(parentIndex, "цель осталась корнем").toBeGreaterThanOrEqual(0);
      expect(rows[parentIndex + 1], "узел вложился").toBe(`1:DndA ${RUN}`);
      expect(rows[parentIndex + 2], "потомок последовал").toBe(`2:DndChild ${RUN}`);
      expect(rows[parentIndex + 3], "и потомок потомка").toBe(`3:DndGrand ${RUN}`);
    } finally {
      for (const id of [rootB, rootA, child]) await deleteCategoryIfExists(token, id);
    }
  });

  test("бросок между строками задаёт порядок соседей, порядок переживает перезагрузку", async ({
    page,
  }) => {
    const token = await operatorToken();
    const root = await createCategory(token, `DndOrd ${RUN}`, `${RUN}-ord`);
    for (const [name, slug] of [
      [`OrdFirst ${RUN}`, `${RUN}-ord-1`],
      [`OrdSecond ${RUN}`, `${RUN}-ord-2`],
      [`OrdThird ${RUN}`, `${RUN}-ord-3`],
    ] as const) {
      await createCategory(token, name, slug, root);
    }

    try {
      await page.goto("/admin/categories");
      // верхняя треть строки OrdFirst — «поставить перед» ним
      await drag(page, `OrdThird ${RUN}`, `OrdFirst ${RUN}`, 4);

      const order = (rows: string[]) =>
        rows.filter((line) => line.includes(`Ord`) && line.startsWith("1:"));

      expect(order(await visibleTree(page))).toEqual([
        `1:OrdThird ${RUN}`,
        `1:OrdFirst ${RUN}`,
        `1:OrdSecond ${RUN}`,
      ]);

      await page.reload();
      expect(order(await visibleTree(page)), "порядок сохранён платформой").toEqual([
        `1:OrdThird ${RUN}`,
        `1:OrdFirst ${RUN}`,
        `1:OrdSecond ${RUN}`,
      ]);
    } finally {
      await deleteCategoryIfExists(token, root);
    }
  });

  test("бросок на собственного потомка не меняет дерево", async ({ page }) => {
    const token = await operatorToken();
    const root = await createCategory(token, `DndCyc ${RUN}`, `${RUN}-cyc`);
    await createCategory(token, `DndCycChild ${RUN}`, `${RUN}-cyc-child`, root);

    try {
      await page.goto("/admin/categories");
      const before = await visibleTree(page);

      let moveRequests = 0;
      page.on("request", (request) => {
        if (request.url().includes("/move")) moveRequests += 1;
      });

      await drag(page, `DndCyc ${RUN}`, `DndCycChild ${RUN}`, 24);

      expect(moveRequests, "запрос перемещения не отправлялся").toBe(0);
      expect(await visibleTree(page), "дерево не изменилось").toEqual(before);
    } finally {
      await deleteCategoryIfExists(token, root);
    }
  });

  test("отказ платформы возвращает прежний вид", async ({ page }) => {
    const token = await operatorToken();
    const rootA = await createCategory(token, `DndErr ${RUN}`, `${RUN}-err-a`);
    const rootB = await createCategory(token, `DndErrB ${RUN}`, `${RUN}-err-b`);

    try {
      await page.goto("/admin/categories");
      const before = await visibleTree(page);

      await page.route("**/move", (route) =>
        route.fulfill({
          status: 422,
          contentType: "application/json",
          body: JSON.stringify({
            error: { code: "validation_failed", message: "Simulated move refusal." },
          }),
        }),
      );

      await drag(page, `DndErr ${RUN}`, `DndErrB ${RUN}`, 24);

      await expect(page.locator("[data-sonner-toast]").first()).toContainText(
        "Simulated move refusal.",
      );
      expect(await visibleTree(page), "дерево прежнее").toEqual(before);
    } finally {
      await deleteCategoryIfExists(token, rootA);
      await deleteCategoryIfExists(token, rootB);
    }
  });
});

test.describe("селект категорий с деревом и поиском", () => {
  /**
   * Узлы адресуются идентификатором, а не текстом: имя узла — подстрока чужих
   * имён проекта («Обзоры» ⊂ «Обзоры автомобилей»), и текстовый локатор ловит
   * соседнюю ветку. Идентификатор берётся из дерева платформы по точному имени.
   */
  async function optionOf(page: Page, name: string): Promise<Locator> {
    const node = findCategory(await categoryTree(await operatorToken()), name);
    expect(node, `категория ${name} есть в проекте`).toBeTruthy();

    return page.locator(`[data-category-option="${node!.id}"]`);
  }

  test("поиск показывает вложенный узел с его положением в дереве", async ({ page }) => {
    await page.goto("/admin/categories/add");
    await page.locator("[data-testid=category-parent]").click();

    await expect(page.locator("[data-category-option]").first()).toBeVisible();

    await page.locator("input[cmdk-input]").fill("Обзор");
    const found = await optionOf(page, "Обзоры");
    await expect(found).toBeVisible();
    await expect(found, "видна цепочка предков").toContainText("Аналитика / Рынок");

    await page.locator("input[cmdk-input]").fill("нет-такого-узла");
    await expect(page.getByText("Категорий не найдено.")).toBeVisible();
  });

  test("множественный выбор в форме поста отражается в триггере", async ({ page }) => {
    await page.goto("/admin/blogs/add");
    const select = page.locator("[data-testid=post-categories-select]");
    await select.click();

    await (await optionOf(page, "Новости")).click();
    await (await optionOf(page, "Рынок")).click();
    await page.keyboard.press("Escape");

    await expect(select).toContainText("Новости, Рынок");
  });

  test("в одиночном режиме свои потомки недоступны для выбора", async ({ page }) => {
    const token = await operatorToken();
    const analitika = findCategory(await categoryTree(token), "Аналитика");
    expect(analitika).toBeTruthy();

    await page.goto(`/admin/categories/${analitika!.id}/edit`);
    await page.locator("[data-testid=category-parent]").click();

    for (const name of ["Аналитика", "Рынок", "Обзоры"]) {
      const option = await optionOf(page, name);
      await expect(option, `${name} недоступна`).toHaveAttribute("aria-disabled", "true");
    }

    const allowed = await optionOf(page, "Разработка");
    await expect(allowed).not.toHaveAttribute("aria-disabled", "true");
  });
});
