import type { Page } from "@playwright/test";

import { env } from "./env";

/**
 * Вход оператора через форму панели.
 *
 * Селекторы — по атрибуту `name` полей: компонент `Input` вёрстки рендерит
 * подпись как `<label>` без `htmlFor`, и поле в неё не вложено, поэтому
 * `getByLabel` подпись с полем не связывает. Имена приходят из `register()`
 * react-hook-form и устойчивы к правкам оформления.
 */
export async function signIn(page: Page): Promise<void> {
  await page.goto("/login");

  await page.locator('input[name="email"]').fill(env.operator.email);
  await page.locator('input[name="password"]').fill(env.operator.password);
  await page.getByRole("button", { name: "Войти" }).click();

  await page.waitForURL("**/admin");
}
