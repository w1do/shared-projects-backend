import type { StoreSettings } from "@/lib/admin/mocks/settings";
import {
  patchStoredStoreSettingsSection,
  readStoredStoreSettings,
} from "@/lib/admin/settings/store";
import { getAdminStoreSettings } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
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
    return {
      ok: false,
      persisted: "none",
      reason: caps.writeReason ?? "Settings writes are not available over the API.",
    };
  }

  const settings = patchStoredStoreSettingsSection(section, value);
  return { ok: true, persisted: "local", settings };
}
