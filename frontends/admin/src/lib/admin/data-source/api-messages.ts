/**
 * Тексты ошибок API платформы для оператора.
 * Отдельный модуль (импорт с расширением) — проверяется node-тестом.
 */

import { t, tf } from "../console-texts.ts";

/** Сообщение для оператора: текст платформы, иначе — по статусу из реестра. */
export function messageFor(
  status: number,
  backendMessage?: string | null,
): string {
  if (backendMessage) return backendMessage;
  if (status === 403) return t("console.api.forbidden");
  if (status === 404) return t("console.api.not-found");
  if (status === 422) return t("console.api.invalid");
  return tf("console.api.failed-with-status", { status });
}
