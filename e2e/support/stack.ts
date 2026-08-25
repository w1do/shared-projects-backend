/**
 * Проверка готовности стека до начала прогона.
 *
 * Без неё неподнятый стек проявляется таймаутом селектора где-то в середине
 * сценария — сообщение, по которому причину не видно.
 */

import { env } from "./env";

export async function assertStackIsUp(): Promise<void> {
  const hint =
    `Стек не отвечает на ${env.baseUrl}. Поднимите его: ./tools/cms up\n` +
    "После правок в frontends/admin перезапустите панель:\n" +
    "  docker restart platform-admin-front-1\n" +
    "иначе сценарии проверят прежнюю сборку.";

  let response: Response;
  try {
    response = await fetch(`${env.baseUrl}/login`, { redirect: "manual" });
  } catch (error) {
    throw new Error(`${hint}\n\nПричина: ${(error as Error).message}`);
  }

  if (response.status >= 500) {
    throw new Error(`${hint}\n\nПанель ответила ${response.status}.`);
  }

  const health = await fetch(`${env.baseUrl}/health/auth`).catch(() => null);
  if (!health?.ok) {
    throw new Error(`${hint}\n\nauth-service не отвечает на /health/auth.`);
  }
}
