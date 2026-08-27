/**
 * Связка «bootstrap платформы → тексты консоли»: после успешного bootstrap
 * переопределения ключей `console.*` подтягиваются из словаря переводов
 * текущего проекта по локали оператора. Сбои проглатываются реестром —
 * панель остаётся на русских значениях по умолчанию.
 */

import { refreshConsoleTexts } from "@/lib/admin/console-texts";
import { getTranslationDictionary } from "./localization";

/** Узкая форма — подходит и `PlatformBootstrap`, и сырой payload логина. */
type ConsoleTextsBootstrap = {
  user?: { locale?: string | null } | null;
  translations_version?: string | null;
};

export function syncConsoleTexts(
  bootstrap: ConsoleTextsBootstrap,
): Promise<void> {
  return refreshConsoleTexts(
    {
      locale: bootstrap.user?.locale || "ru",
      version: bootstrap.translations_version || "0",
    },
    getTranslationDictionary,
  );
}
