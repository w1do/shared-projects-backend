/**
 * Versioned localStorage store for full store settings blob (mock backend).
 */
import type { StoreSettings } from "@/lib/admin/mocks/settings";
import { mockStoreSettings } from "@/lib/admin/mocks/settings";
import { readJson, writeJson } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const settingsStorageKey = storageKey("store-settings");
const settingsSeedVersionKey = storageKey("store-settings-seed-version");
const currentSettingsSeedVersion = "1";

export function readStoredStoreSettings(): StoreSettings {
  if (typeof window === "undefined") {
    return structuredClone(mockStoreSettings);
  }

  const version = window.localStorage.getItem(settingsSeedVersionKey);
  const stored = readJson<StoreSettings>(settingsStorageKey);

  if (!stored || version !== currentSettingsSeedVersion) {
    const seed = structuredClone(mockStoreSettings);
    writeJson(settingsStorageKey, seed);
    window.localStorage.setItem(settingsSeedVersionKey, currentSettingsSeedVersion);
    return seed;
  }

  return stored;
}

export function writeStoredStoreSettings(settings: StoreSettings) {
  writeJson(settingsStorageKey, settings);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(settingsSeedVersionKey, currentSettingsSeedVersion);
  }
}

export function patchStoredStoreSettingsSection<K extends keyof StoreSettings>(
  section: K,
  value: StoreSettings[K],
): StoreSettings {
  const current = readStoredStoreSettings();
  const next = { ...current, [section]: value };
  writeStoredStoreSettings(next);
  return next;
}
