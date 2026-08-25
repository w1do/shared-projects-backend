import { defineConfig, devices } from "@playwright/test";

import { STORAGE_STATE } from "./support/env";

/**
 * Сценарии панели управления.
 *
 * Прогон идёт против стека, поднятого `./tools/cms up`: панель отдаётся тем же
 * gateway, что и API, и собрана в production-режиме внутри контейнера. Playwright
 * ничего не поднимает сам — иначе проверялась бы не та сборка, что видит оператор,
 * и мимо `src/proxy.ts`.
 *
 * Режим — параметр запуска, а не отдельный набор тестов: `E2E_HEADED=1` открывает
 * окно браузера и замедляет шаги, без переменной прогон идёт headless (CI).
 */

const headed = process.env.E2E_HEADED === "1";

// В headed-режиме шаги замедляются, чтобы их было видно глазом.
const launchOptions = headed ? { slowMo: 400 } : {};

export default defineConfig({
  testDir: "./tests",
  outputDir: "./.artifacts/test-results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Сценарии меняют состояние проекта и восстанавливают его — параллелить нельзя.
  workers: 1,
  reporter: process.env.CI
    ? [["list"], ["html", { outputFolder: "./.artifacts/report", open: "never" }]]
    : [["list"]],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      use: { ...devices["Desktop Chrome"], headless: !headed, launchOptions },
    },
    {
      name: "chromium",
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        headless: !headed,
        launchOptions,
        storageState: STORAGE_STATE,
      },
    },
  ],
});
