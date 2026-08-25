import type { StoreSettings } from "@/lib/admin/mocks/settings";
import {
  patchStoredStoreSettingsSection,
  readStoredStoreSettings,
} from "@/lib/admin/settings/store";
import { getAdminStoreSettings } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import * as platformAuth from "@/lib/admin/data-source/platform/auth";
import { getSettingsCapabilities } from "./capabilities";

export { getSettingsCapabilities };

export type SettingsPersistResult = {
  ok: boolean;
  persisted: "local" | "server" | "none";
  reason?: string;
  settings?: StoreSettings;
};

export async function getStoreSettings(): Promise<StoreSettings> {
  if (!shouldUseAdminApi()) {
    return readStoredStoreSettings();
  }
  return getAdminStoreSettings();
}

/**
 * Persist a settings section. API mode is read-only today — never pretend a server save.
 * Mock mode writes the full settings blob to localStorage.
 */
export async function saveSettingsSection<K extends keyof StoreSettings>(
  section: K,
  value: StoreSettings[K],
): Promise<SettingsPersistResult> {
  const caps = getSettingsCapabilities();
  if (!caps.write) {
    return {
      ok: false,
      persisted: "none",
      reason: caps.writeReason,
    };
  }

  if (shouldUseAdminApi()) {
    // В платформе есть данные проекта; остальные секции — витринные, аналога нет.
    if (section === "general") {
      const general = value as StoreSettings["general"];
      await platformAuth.updateProject({ name: general.storeName });
      return { ok: true, persisted: "server" };
    }

    return {
      ok: false,
      persisted: "none",
      reason:
        "This section has no counterpart in the platform (storefront payments/shipping/taxes). Values stay on demo data.",
    };
  }

  const settings = patchStoredStoreSettingsSection(section, value);
  return { ok: true, persisted: "local", settings };
}

/** API-ключи проекта: чтение, выдача (ключ показывается один раз) и отзыв. */
export const projectApiKeys = {
  list: () => platformAuth.listApiKeys(),
  issue: (type: "public" | "secret", scopes?: string[]) =>
    platformAuth.issueApiKey({ type, scopes }),
  revoke: (id: string) => platformAuth.revokeApiKey(id),
};

/** Сервисы проекта: включение/выключение и их настройки. */
export const projectServices = {
  list: () => platformAuth.listServices(),
  toggle: (service: string, enabled: boolean) => platformAuth.toggleService(service, enabled),
  getSettings: (service: string) => platformAuth.getServiceSettings(service),
  putSettings: (service: string, values: Record<string, unknown>) =>
    platformAuth.putServiceSettings(service, values),
};
