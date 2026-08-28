/** localization → content-service: словарь переводов проекта и автоперевод. */

import { adminApiGet, adminApiSend } from "../api-client";

const base = "/api/admin/v1/projects/{project}/content";

export type PlatformTranslation = {
  id: number;
  key: string;
  /** локаль → значение */
  values: Record<string, string>;
  /** локали, заполненные автопереводом */
  machine: Record<string, boolean>;
};

export function listTranslations() {
  return adminApiGet<PlatformTranslation[]>(`${base}/translations`);
}

/** Плоский словарь `{ключ: значение}` по локали с откатом на локаль проекта по умолчанию. */
export function getTranslationDictionary(locale: string) {
  return adminApiGet<Record<string, string>>(
    `${base}/translations?locale=${encodeURIComponent(locale)}`,
  );
}

export function createTranslation(key: string, values: Record<string, string>) {
  return adminApiSend<PlatformTranslation>(`${base}/translations`, {
    method: "POST",
    body: { key, values },
  });
}

export function updateTranslation(
  id: number,
  key: string,
  values: Record<string, string>,
) {
  return adminApiSend<PlatformTranslation>(`${base}/translations/${id}`, {
    method: "PUT",
    body: { key, values },
  });
}

export function deleteTranslation(id: number) {
  return adminApiSend<void>(`${base}/translations/${id}`, { method: "DELETE" });
}

/** Ставит фоновый автоперевод недостающих локалей словаря и имён категорий. */
export function translateMissing() {
  return adminApiSend<void>(`${base}/translations/translate-missing`, {
    method: "POST",
  });
}
