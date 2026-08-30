import { expect, test } from "@playwright/test";

import { operatorToken } from "../support/platform";
import { env } from "../support/env";

/**
 * Управление доступом в панели: вкладка «Роли» раздела «Команда».
 *
 * Сценарий идёт по пути оператора: системные роли пришли из шаблонов платформы
 * (`permissions:sync`), кастомная роль собирается чекбоксами каталога прав и
 * сразу доступна для назначения участнику. Проект возвращается в исходное
 * состояние: созданная роль удаляется тем же сценарием.
 *
 * Что участник с ролью видит ровно свои разделы, проверяет middleware-тест
 * auth-сервиса: у приглашённого оператора нет пароля, войти им сценарий не может.
 */

const ROLE_NAME = "e2e-moderator";

/** Роль остаётся только на время прогона: перед стартом снимаем хвосты прошлого. */
async function dropRole(token: string): Promise<void> {
  const list = await fetch(
    `${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/roles`,
    { headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }, cache: "no-store" },
  );
  const roles = (await list.json()).data as Array<{ id: number; name: string }>;
  const stale = roles.find((role) => role.name === ROLE_NAME);

  if (!stale) return;

  await fetch(`${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/roles/${stale.id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
}

test.beforeEach(async () => {
  await dropRole(await operatorToken());
});

test.afterEach(async () => {
  await dropRole(await operatorToken());
});

test("роль проекта собирается чекбоксами и сразу доступна для назначения", async ({ page }) => {
  await page.goto("/admin/team");

  await page.getByRole("tab", { name: "Роли" }).click();

  // Системные роли платформы, включая роли под оплату и лицензирование
  const roles = page.getByRole("button").filter({ hasText: "Системная" });
  await expect(roles.filter({ hasText: "Владелец" })).toBeVisible();
  await expect(roles.filter({ hasText: "Оплата" })).toBeVisible();
  await expect(roles.filter({ hasText: "Лицензирование" })).toBeVisible();

  // Системная роль открывается только на просмотр
  await roles.filter({ hasText: "Владелец" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("button", { name: "Сохранить роль" })).toHaveCount(0);
  await expect(dialog.locator('button[role="checkbox"]').first()).toBeDisabled();
  await dialog.getByRole("button", { name: "Закрыть" }).click();

  // Кастомная роль: название и права чекбоксами каталога
  await page.getByRole("button", { name: "Создать роль" }).click();
  await dialog.locator("input").first().fill(ROLE_NAME);
  await dialog.locator('button[role="checkbox"]').nth(0).click();
  await dialog.locator('button[role="checkbox"]').nth(1).click();
  await dialog.getByRole("button", { name: "Сохранить роль" }).click();

  const created = page.getByRole("button").filter({ hasText: ROLE_NAME });
  await expect(created).toBeVisible();
  await expect(created).toContainText("Прав: 2");

  // Новая роль доступна для назначения без перезагрузки страницы
  await page.getByRole("tab", { name: "Участники" }).click();
  await page.getByRole("button", { name: "Пригласить участника" }).click();
  await dialog.getByRole("button", { name: "Выберите роль" }).click();
  await expect(page.getByRole("menuitemradio", { name: ROLE_NAME })).toBeVisible();
  await page.keyboard.press("Escape");
  await dialog.getByRole("button", { name: "Отмена" }).click();

  // Правка состава: снятая отметка уходит из роли
  await page.getByRole("tab", { name: "Роли" }).click();
  await created.click();
  await dialog.locator('button[role="checkbox"][data-state="checked"]').first().click();
  await dialog.getByRole("button", { name: "Сохранить роль" }).click();
  await expect(created).toContainText("Прав: 1");

  // Занятое название платформа отклоняет, роль не создаётся
  await page.getByRole("button", { name: "Создать роль" }).click();
  await dialog.locator("input").first().fill(ROLE_NAME);
  await dialog.locator('button[role="checkbox"]').nth(0).click();
  await dialog.getByRole("button", { name: "Сохранить роль" }).click();
  await expect(dialog.locator(".text-destructive")).toContainText("already used");
  await dialog.getByRole("button", { name: "Отмена" }).click();

  // Удаление кастомной роли
  await created.getByRole("button", { name: "Действия с ролью" }).click();
  await page.getByRole("menuitem", { name: "Удалить роль" }).click();
  await page.getByRole("button", { name: "Подтвердить удаление" }).click();
  await expect(page.getByRole("button").filter({ hasText: ROLE_NAME })).toHaveCount(0);
});
