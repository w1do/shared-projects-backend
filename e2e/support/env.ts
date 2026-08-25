/**
 * Параметры прогона.
 *
 * Значения по умолчанию — только локальные: сценарии меняют состояние проекта
 * и не предназначены для запуска против окружения с реальными данными.
 */

export const env = {
  baseUrl: process.env.E2E_BASE_URL ?? "http://localhost:8080",
  projectKey: process.env.E2E_PROJECT ?? "demo",
  operator: {
    email: process.env.E2E_EMAIL ?? "root@example.com",
    password: process.env.E2E_PASSWORD ?? "secret-123",
  },
  headed: process.env.E2E_HEADED === "1",
};

/** Файл сохранённого состояния входа: cookies + localStorage. */
export const STORAGE_STATE = "./.artifacts/storage-state.json";
