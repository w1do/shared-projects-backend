import type { StoreSettings } from "@/lib/admin/types/settings";
import { t } from "@/lib/admin/console-texts";
import { getAdminStoreSettings } from "@/lib/admin/data-source/admin-data";
import * as platformAuth from "@/lib/admin/data-source/platform/auth";
import * as platformAccess from "@/lib/admin/data-source/platform/auth-access";

export type SettingsPersistResult = {
  ok: boolean;
  persisted: "server" | "none";
  reason?: string;
  settings?: StoreSettings;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  return getAdminStoreSettings();
}

/**
 * Сохранение секции настроек. В платформе есть данные проекта; секции без
 * аналога сохранять некуда — об этом честно сообщается вызывающему.
 */
export async function saveSettingsSection<K extends keyof StoreSettings>(
  section: K,
  value: StoreSettings[K],
): Promise<SettingsPersistResult> {
  if (section !== "general") {
    return {
      ok: false,
      persisted: "none",
      reason: t("console.settings.no-platform-counterpart"),
    };
  }

  const general = value as StoreSettings["general"];
  await platformAuth.updateProject({ name: general.storeName });
  return { ok: true, persisted: "server" };
}

/** API-ключи проекта: чтение, выдача (ключ показывается один раз) и отзыв. */
export const projectApiKeys = {
  list: () => platformAccess.listApiKeys(),
  issue: (type: "public" | "secret", scopes?: string[]) =>
    platformAccess.issueApiKey({ type, scopes }),
  revoke: (id: string) => platformAccess.revokeApiKey(id),
};

/** Сервисы проекта: включение/выключение и их настройки. */
export const projectServices = {
  list: () => platformAccess.listServices(),
  toggle: (service: string, enabled: boolean) =>
    platformAccess.toggleService(service, enabled),
  getSettings: (service: string) => platformAccess.getServiceSettings(service),
  putSettings: (service: string, values: Record<string, unknown>) =>
    platformAccess.putServiceSettings(service, values),
};
