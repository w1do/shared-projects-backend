/** auth-service: проект, пользователи проекта, участники и роли, ключи, сервисы и их настройки. */

import { adminApiGet, adminApiGetPage, adminApiSend } from "../api-client";
import { rememberSectionSnapshot } from "../session";
import { syncConsoleTexts } from "./console-texts-loader";
import type {
  PlatformAuditEntry,
  PlatformBootstrap,
  PlatformProject,
} from "./types";

const base = "/api/admin/v1/projects/{project}";

export type PlatformProjectUser = {
  id: number;
  name: string | null;
  email: string;
  project_id: string;
  blocked: boolean;
};

export type PlatformMember = {
  id: number;
  name: string;
  email: string;
  roles: string[];
};

export type PlatformRole = {
  id: number | string;
  name: string;
  permissions?: string[];
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

/**
 * Успешный bootstrap заодно обновляет снимок видимых разделов (смена проекта
 * и т.п.) и переопределения текстов консоли из словаря проекта.
 */
export async function getBootstrap(projectKey?: string) {
  const suffix = projectKey ? `?project=${encodeURIComponent(projectKey)}` : "";
  const bootstrap = await adminApiGet<PlatformBootstrap>(
    `/api/admin/v1/bootstrap${suffix}`,
  );
  rememberSectionSnapshot(bootstrap);
  void syncConsoleTexts(bootstrap);
  return bootstrap;
}

/**
 * Создание проекта: платформа выводит ключ из названия сама.
 * Путь не скоупится текущим проектом — нового проекта у оператора ещё нет.
 */
export function createProject(body: { name: string }) {
  return adminApiSend<PlatformProject>("/api/admin/v1/projects", {
    method: "POST",
    body,
  });
}

export function getProject() {
  return adminApiGet<PlatformProject>(`${base}/`);
}

export function updateProject(body: {
  name?: string;
  description?: string | null;
  topic?: string | null;
  locales?: string[];
}) {
  return adminApiSend<PlatformProject>(`${base}/`, { method: "PATCH", body });
}

/** Пользователи проекта (сайта), раздел customers. */
export async function listProjectUsers() {
  const page = await adminApiGetPage<PlatformProjectUser>(`${base}/users`);
  return page.items;
}

export function blockProjectUser(id: number | string) {
  return adminApiSend<PlatformProjectUser>(`${base}/users/${id}/block`, {
    method: "POST",
  });
}

export function unblockProjectUser(id: number | string) {
  return adminApiSend<PlatformProjectUser>(`${base}/users/${id}/unblock`, {
    method: "POST",
  });
}

export function deleteProjectUser(id: number | string) {
  return adminApiSend<void>(`${base}/users/${id}`, { method: "DELETE" });
}

/** Операторы проекта, раздел team. */
export function listMembers() {
  return adminApiGet<PlatformMember[]>(`${base}/members`);
}

/**
 * Роль вёрстки → роль проекта в платформе.
 *
 * `cms-auth.php` заводит на проект роли `owner, admin, editor, analyst, viewer`;
 * вёрстка оперирует тройкой `admin/manager/staff`. Без сопоставления платформа
 * отвечает «Unknown role for this project».
 */
const PLATFORM_ROLE: Record<string, string> = {
  admin: "admin",
  manager: "editor",
  staff: "viewer",
};

export function toPlatformRole(role: string): string {
  return PLATFORM_ROLE[role.toLowerCase()] ?? role;
}

/** Роль проекта → роль вёрстки. Обратное сопоставление для списков и селектов. */
export function toConsoleRole(roles: string[]): "admin" | "manager" | "staff" {
  const role = roles[0]?.toLowerCase() ?? "";
  if (role === "owner" || role === "admin") return "admin";
  if (role === "editor") return "manager";
  return "staff";
}

export function inviteMember(body: {
  email: string;
  name?: string;
  role: string;
}) {
  return adminApiSend<{ id: number; role: string }>(`${base}/members`, {
    method: "POST",
    body: { ...body, role: toPlatformRole(body.role) },
  });
}

export function assignMemberRole(memberId: number | string, role: string) {
  return adminApiSend<void>(`${base}/members/${memberId}/role`, {
    method: "PUT",
    body: { role: toPlatformRole(role) },
  });
}

export function removeMember(memberId: number | string) {
  return adminApiSend<void>(`${base}/members/${memberId}`, {
    method: "DELETE",
  });
}

/**
 * Последние события журнала действий проекта.
 *
 * Журнал отдаётся курсорной страницей — общего числа записей в ответе нет,
 * поэтому берётся только первая страница и обрезается до нужного числа.
 */
export async function listAuditEntries(limit = 10) {
  const page = await adminApiGetPage<PlatformAuditEntry>(`${base}/audit`);

  return page.items.slice(0, limit);
}

export function listRoles() {
  return adminApiGet<PlatformRole[]>(`${base}/roles`);
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
export type PlatformSiteSettings = {
  language: string;
  currency_default: string;
  currencies: string[];
};

export function getSiteSettings() {
  return adminApiGet<PlatformSiteSettings>(`${base}/site-settings`);
}

export function putSiteSettings(body: PlatformSiteSettings) {
  return adminApiSend<PlatformSiteSettings>(`${base}/site-settings`, {
    method: "PUT",
    body,
  });
}
