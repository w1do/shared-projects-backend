/** auth-service: проект, его пользователи и участники команды. */

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

/** Роль проекта → подпись роли в разделе настроек (тройка вёрстки склада). */
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
    body,
  });
}

export function assignMemberRole(memberId: number | string, role: string) {
  return adminApiSend<void>(`${base}/members/${memberId}/role`, {
    method: "PUT",
    body: { role },
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
