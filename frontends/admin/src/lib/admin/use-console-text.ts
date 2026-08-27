"use client";

import * as React from "react";

import {
  consoleTextsRevision,
  subscribeConsoleTexts,
  t,
} from "./console-texts";

/**
 * Тексты консоли в компонентах: `t` с подпиской на контекст переопределений.
 * Компонент ре-рендерится, когда словарь проекта загружает или обновляет
 * переопределения ключей `console.*`.
 */
export function useConsoleText() {
  React.useSyncExternalStore(
    subscribeConsoleTexts,
    consoleTextsRevision,
    consoleTextsRevision,
  );
  return t;
}
