/**
 * Обращения к API платформы из сценариев: подготовка состояния и его возврат.
 *
 * Всё, что меняет состояние проекта, обязано вернуть его обратно — прогон не
 * должен оставлять за собой изменённое окружение.
 */

import { env } from "./env";

async function json(response: Response, what: string): Promise<any> {
  if (!response.ok) {
    throw new Error(`${what}: HTTP ${response.status} ${await response.text()}`);
  }

  return response.json();
}

/** Токен оператора для служебных вызовов (подготовка состояния, не проверка входа). */
export async function operatorToken(): Promise<string> {
  const response = await fetch(`${env.baseUrl}/api/admin/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(env.operator),
  });

  const payload = await json(response, "Вход оператора");

  return payload.data.token;
}

export type Bootstrap = {
  permissions: string[];
  services: Array<{ key: string; enabled: boolean }>;
  current_project: string | null;
};

export async function bootstrap(token: string): Promise<Bootstrap> {
  const response = await fetch(`${env.baseUrl}/api/admin/v1/bootstrap`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    cache: "no-store",
  });

  return (await json(response, "bootstrap")).data;
}

/** Прямое переключение сервиса — страховочное восстановление UI-сценариев. */
export async function setService(token: string, service: string, enabled: boolean): Promise<void> {
  const response = await fetch(
    `${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/services/${service}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ enabled }),
    },
  );

  await json(response, `Переключение сервиса ${service}`);
}

/**
 * Ждёт, пока `content` снова отвечает этому токену.
 *
 * Включение сервиса auth-service разносит по остальным фоновой задачей
 * (`/internal/cache-bust`), а до неё content отвечает 404 по прежнему снимку
 * интроспекции — снимок кэшируется на 90 секунд. Сценарий, который трогал
 * сервис, обязан дождаться, иначе следующий получит 404 на ровном месте.
 */
export async function waitForContentService(token: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await fetch(
      `${env.baseUrl}/api/admin/v1/projects/${env.projectKey}/content/categories`,
      {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        cache: "no-store",
      },
    );

    if (response.status === 200) return;

    // 404 — снимок интроспекции ещё старый; остальное к ожиданию не относится
    if (response.status !== 404) {
      throw new Error(`Проверка content вернула ${response.status}: ${await response.text()}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  throw new Error("Сервис content не вернулся в строй: маршруты всё ещё отвечают 404.");
}

/**
 * Выполнить действие при выключенном сервисе и вернуть его в исходное состояние.
 *
 * Восстановление идёт в `finally`: упавшая проверка не должна оставлять проект
 * с выключенным сервисом.
 */
export async function withServiceDisabled<T>(
  token: string,
  service: string,
  action: () => Promise<T>,
): Promise<T> {
  const before = await bootstrap(token);
  const wasEnabled = before.services.some((s) => s.key === service && s.enabled);

  await setService(token, service, false);
  try {
    return await action();
  } finally {
    if (wasEnabled) {
      await setService(token, service, true);
    }
  }
}
