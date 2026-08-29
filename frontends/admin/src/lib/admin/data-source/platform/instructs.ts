/** content-service: инструкции генерации и сборка проекта по AI. */

import { adminApiGet, adminApiSend } from "../api-client";

const base = "/api/admin/v1/projects/{project}/content";

export type PlatformInstruct = {
  id: number;
  title: string;
  category: string;
  category_label: string;
  rule: string;
  schema: Record<string, unknown>;
  published: boolean;
  is_system: boolean;
  updated_at: string | null;
};

export type PlatformInstructCategory = { value: string; label: string };

export type PlatformBuildout = {
  id: number;
  topic: string;
  status: string;
  status_label: string;
  categories_created: number;
  project_updated: boolean;
  error_message: string | null;
  completed_at: string | null;
  created_at: string | null;
};

export type UpsertInstructBody = {
  title: string;
  category: string;
  rule: string;
  schema: Record<string, unknown>;
  published?: boolean;
};

export function listInstructs(params?: { category?: string }) {
  const suffix = params?.category
    ? `?category=${encodeURIComponent(params.category)}`
    : "";
  return adminApiGet<PlatformInstruct[]>(`${base}/instructs${suffix}`);
}

export function listInstructCategories() {
  return adminApiGet<PlatformInstructCategory[]>(
    `${base}/instructs/categories`,
  );
}

export function createInstruct(body: UpsertInstructBody) {
  return adminApiSend<PlatformInstruct>(`${base}/instructs`, {
    method: "POST",
    body,
  });
}

export function updateInstruct(id: number, body: UpsertInstructBody) {
  return adminApiSend<PlatformInstruct>(`${base}/instructs/${id}`, {
    method: "PUT",
    body,
  });
}

export function deleteInstruct(id: number) {
  return adminApiSend<null>(`${base}/instructs/${id}`, { method: "DELETE" });
}

export function getBuildout() {
  return adminApiGet<PlatformBuildout | null>(`${base}/buildout`);
}

export function startBuildout(body: { topic: string; overwrite?: boolean }) {
  return adminApiSend<PlatformBuildout>(`${base}/buildout`, {
    method: "POST",
    body,
  });
}
