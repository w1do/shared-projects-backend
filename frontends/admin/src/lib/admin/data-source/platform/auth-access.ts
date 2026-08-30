/** auth-service: доступы проекта — роли, API-ключи, сервисы и их настройки. */

import { adminApiGet, adminApiSend } from "../api-client";

const base = "/api/admin/v1/projects/{project}";

export type PlatformRole = {
  id: number | string;
  name: string;
  /** Системная роль раскрывается шаблоном платформы: только просмотр. */
  system?: boolean;
  permissions?: string[];
};

/** Право каталога проекта: источник чекбоксов в диалоге роли. */
export type PlatformPermission = {
  key: string;
  label: string;
  group: string | null;
  service: string;
};

export type PlatformApiKey = {
  id: string;
  type: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  revoked_at: string | null;
  /** Полный ключ отдаётся ровно один раз — при выдаче. */
  key?: string | null;
};

export type PlatformServiceStatus = {
  service: string;
  enabled: boolean;
  version?: string | null;
};

export type PlatformSettingValue = { key: string; value: unknown };

export function listRoles() {
  return adminApiGet<PlatformRole[]>(`${base}/roles`);
}

/** Права, доступные проекту: права выключенных сервисов платформа не отдаёт. */
export function listPermissions() {
  return adminApiGet<PlatformPermission[]>(`${base}/permissions`);
}

export function createRole(body: { name: string; permissions: string[] }) {
  return adminApiSend<PlatformRole>(`${base}/roles`, { method: "POST", body });
}

export function updateRolePermissions(
  id: number | string,
  permissions: string[],
) {
  return adminApiSend<PlatformRole>(`${base}/roles/${id}`, {
    method: "PUT",
    body: { permissions },
  });
}

export function deleteRole(id: number | string) {
  return adminApiSend<void>(`${base}/roles/${id}`, { method: "DELETE" });
}

export function listApiKeys() {
  return adminApiGet<PlatformApiKey[]>(`${base}/api-keys`);
}

export function issueApiKey(body: { type: string; scopes?: string[] }) {
  return adminApiSend<PlatformApiKey>(`${base}/api-keys`, {
    method: "POST",
    body,
  });
}

export function revokeApiKey(id: string) {
  return adminApiSend<void>(`${base}/api-keys/${id}`, { method: "DELETE" });
}

export function listServices() {
  return adminApiGet<PlatformServiceStatus[]>(`${base}/services`);
}

export function toggleService(service: string, enabled: boolean) {
  return adminApiSend<{ service: string; enabled: boolean }>(
    `${base}/services/${service}`,
    {
      method: "PUT",
      body: { enabled },
    },
  );
}

export function getServiceSettings(service: string) {
  return adminApiGet<PlatformSettingValue[]>(`${base}/settings/${service}`);
}

export function putServiceSettings(
  service: string,
  values: Record<string, unknown>,
) {
  return adminApiSend<PlatformSettingValue[]>(`${base}/settings/${service}`, {
    method: "PUT",
    body: { values },
  });
}

/** Настройки сайта проекта: язык и валюты по умолчанию (auth-service). */
/** Допустимые значения настроек: платформа отдаёт их вместе со значениями. */
export type PlatformSiteSettingsOptions = {
  project_types: string[];
  timezones: string[];
  currencies: string[];
  locales: string[];
};

export type PlatformSiteSettings = {
  project_type: string;
  timezone: string;
  language: string;
  currency_default: string;
  currencies: string[];
  options: PlatformSiteSettingsOptions;
};

/** Тело записи: перечни допустимых значений платформа не принимает. */
export type PlatformSiteSettingsInput = Omit<PlatformSiteSettings, "options">;

export function getSiteSettings() {
  return adminApiGet<PlatformSiteSettings>(`${base}/site-settings`);
}

export function putSiteSettings(body: PlatformSiteSettingsInput) {
  return adminApiSend<PlatformSiteSettings>(`${base}/site-settings`, {
    method: "PUT",
    body,
  });
}
