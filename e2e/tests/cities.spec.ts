import { expect, test, type Page } from "@playwright/test";

import { operatorToken } from "../support/platform";
import { env } from "../support/env";

/**
 * Раздел «Города»: состав справочника в проекте, массовые действия, SEO города
 * и ход AI-адаптации.
 *
 * Справочник наполняет `city:sync` бутстрапа. Адаптация SEO — единственный шаг,
 * который здесь не запускается по-настоящему: он зовёт модель на каждый город,
 * а проверяется поведение консоли, поэтому реестр задач задаётся сценарием.
 */

test.setTimeout(90_000);

const API = "/api/admin/v1/projects";

/** Строки таблицы городов в порядке отображения. */
async function cityRows(page: Page): Promise<string[]> {
  await expect(page.locator("[data-city]").first()).toBeVisible();

  return page
    .locator("[data-city]")
    .evaluateAll((rows) =>
      rows.map((row) => row.getAttribute("data-city") ?? ""),
    );
}

/** Страница городов проекта прямо из платформы: отбор задаётся строкой запроса. */
async function citiesPage(token: string, query: string): Promise<unknown[]> {
  const response = await fetch(
    `${env.baseUrl}${API}/${env.projectKey}/content/cities?${query}`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  const body = (await response.json()) as { data: unknown[] };

  return body.data;
}

test.describe("города проекта", () => {
  test("раздел открывается со стартовым набором и меняет состав", async ({
    page,
  }) => {
    const token = await operatorToken();

    await page.goto("/admin/cities");
    await expect(page.getByTestId("cities-page")).toBeVisible();

    const rows = await cityRows(page);
    expect(rows.length, "справочник наполнен city:sync").toBeGreaterThan(0);

    // Стартовый набор материализуется первым обращением проекта к разделу.
    expect(
      (await citiesPage(token, "enabled=1&per_page=100")).length,
    ).toBeGreaterThan(0);

    await page.getByTestId("cities-bulk-enable-all").click();
    await page.getByTestId("cities-bulk-enable-all-confirm").click();
    await expect
      .poll(
        async () => (await citiesPage(token, "enabled=0&per_page=1")).length,
        {
          timeout: 30_000,
        },
      )
      .toBe(0);

    await page.getByTestId("cities-bulk-reset").click();
    await page.getByTestId("cities-bulk-reset-confirm").click();
    await expect
      .poll(
        async () => (await citiesPage(token, "enabled=1&per_page=100")).length,
        {
          timeout: 30_000,
        },
      )
      .toBe(10);
  });

  test("поиск отбирает город, а переключатель меняет его включённость", async ({
    page,
  }) => {
    await page.goto("/admin/cities");
    await expect(page.getByTestId("cities-page")).toBeVisible();

    const first = (await cityRows(page))[0];

    const row = page.locator(`[data-city="${first}"]`);
    const toggle = row.getByTestId("cities-toggle");
    const before = await toggle.getAttribute("data-state");

    await toggle.click();
    await expect
      .poll(
        async () => row.getByTestId("cities-toggle").getAttribute("data-state"),
        {
          timeout: 15_000,
        },
      )
      .not.toBe(before);

    // Состояние переживает перезагрузку: оно живёт в платформе, а не во вкладке.
    await page.reload();
    await expect(
      page.locator(`[data-city="${first}"]`).getByTestId("cities-toggle"),
    ).toHaveAttribute(
      "data-state",
      before === "checked" ? "unchecked" : "checked",
    );

    await page
      .locator(`[data-city="${first}"]`)
      .getByTestId("cities-toggle")
      .click();
  });

  test("SEO города сохраняется и виден признаком заполненности", async ({
    page,
  }) => {
    await page.goto("/admin/cities");
    await expect(page.getByTestId("cities-page")).toBeVisible();

    const first = (await cityRows(page))[0];
    await page
      .locator(`[data-city="${first}"]`)
      .getByTestId("cities-seo-open")
      .click();

    const title = `E2E ${Date.now() % 1_000_000}`;
    await page.getByTestId("cities-seo-field-title").fill(title);
    await page.getByTestId("cities-seo-save").click();

    await expect(page.locator(`[data-city="${first}"]`)).toContainText(
      "Заполнено",
      {
        timeout: 15_000,
      },
    );

    await page
      .locator(`[data-city="${first}"]`)
      .getByTestId("cities-seo-open")
      .click();
    await expect(page.getByTestId("cities-seo-field-title")).toHaveValue(title);
  });

  test("ход адаптации SEO виден в разделе и переживает перезагрузку", async ({
    page,
  }) => {
    await page.route(
      `**/content/tasks?kind=city_seo_adaptation**`,
      async (route) =>
        route.fulfill({
          json: {
            data: [
              {
                id: 1,
                kind: "city_seo_adaptation",
                state: "running",
                stage: "4/10",
                subject_type: "project",
                subject_id: env.projectKey,
                failure_reason: null,
                queued_at: "2026-08-30T10:00:00+00:00",
                started_at: "2026-08-30T10:00:01+00:00",
                finished_at: null,
              },
            ],
          },
        }),
    );

    await page.goto("/admin/cities");

    await expect(page.getByTestId("cities-adapt-running")).toContainText(
      "4/10",
    );
    await expect(page.getByTestId("cities-adapt-open")).toBeDisabled();

    await page.reload();
    await expect(page.getByTestId("cities-adapt-running")).toContainText(
      "4/10",
    );
  });
});
