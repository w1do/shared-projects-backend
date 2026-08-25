import { expect, test as setup } from "@playwright/test";

import { STORAGE_STATE } from "../support/env";
import { signIn } from "../support/session";
import { assertStackIsUp } from "../support/stack";

/**
 * Вход оператора — предпосылка остальных сценариев.
 *
 * Выполняется один раз, состояние сохраняется и подставляется остальным проектам.
 * Сохранять только cookies недостаточно: меню рендерится по снимку разделов из
 * localStorage, а guard `src/proxy.ts` читает одноимённую cookie. Если снимок не
 * записан, панель трактует это как «снимок не готов» и показывает все разделы —
 * сценарий про состав меню тогда позеленел бы, ничего не проверив.
 */
setup("вход оператора и сохранение состояния", async ({ page }) => {
  await assertStackIsUp();

  await signIn(page);

  // Снимок разделов должен быть записан в оба хранилища — иначе проверять нечего.
  const snapshot = await page.evaluate(() => ({
    storage: window.localStorage.getItem("console_sections"),
    cookie: document.cookie.match(/(?:^|; )console_sections=([^;]*)/)?.[1] ?? null,
  }));

  expect(snapshot.storage, "console_sections в localStorage").toBeTruthy();
  expect(snapshot.cookie, "console_sections в cookie").toBeTruthy();

  await page.context().storageState({ path: STORAGE_STATE });
});
