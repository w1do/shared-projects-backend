/** content-service: посты, категории, SEO. Пути скоупятся текущим проектом. */

import { adminApiGet, adminApiGetPage, adminApiSend } from "../api-client";
import type {
  PlatformCategory,
  PlatformPost,
  PlatformRevision,
  PlatformSeo,
} from "./types";

const base = "/api/admin/v1/projects/{project}/content";

export type UpsertPostBody = {
  title: string;
  slug?: string;
  body?: string | null;
  locale?: string;
  categories?: number[];
  is_index?: boolean;
};

export async function listPosts(params?: { status?: string; locale?: string; category?: number }) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.locale) query.set("locale", params.locale);
  if (params?.category != null) query.set("category", String(params.category));
  const suffix = query.size > 0 ? `?${query.toString()}` : "";

  const page = await adminApiGetPage<PlatformPost>(`${base}/posts${suffix}`);
  return page.items;
}

export function getPost(id: number) {
  return adminApiGet<PlatformPost>(`${base}/posts/${id}`);
}

export function createPost(body: UpsertPostBody) {
  return adminApiSend<PlatformPost>(`${base}/posts`, { method: "POST", body });
}

export function updatePost(id: number, body: UpsertPostBody) {
  return adminApiSend<PlatformPost>(`${base}/posts/${id}`, { method: "PUT", body });
}

export function deletePost(id: number) {
  return adminApiSend<null>(`${base}/posts/${id}`, { method: "DELETE" });
}

export function changePostStatus(id: number, status: string, scheduledAt?: string) {
  return adminApiSend<PlatformPost>(`${base}/posts/${id}/status`, {
    method: "POST",
    body: scheduledAt ? { status, scheduled_at: scheduledAt } : { status },
  });
}

export function listPostRevisions(id: number) {
  return adminApiGet<PlatformRevision[]>(`${base}/posts/${id}/revisions`);
}

export function restorePostRevision(id: number, revisionId: number) {
  return adminApiSend<PlatformPost>(`${base}/posts/${id}/revisions/${revisionId}/restore`, {
    method: "POST",
  });
}

export function listCategories() {
  return adminApiGet<PlatformCategory[]>(`${base}/categories`);
}

export function createCategory(body: {
  name: string | Record<string, string>;
  slug?: string;
  parent_id?: number | null;
}) {
  return adminApiSend<PlatformCategory>(`${base}/categories`, { method: "POST", body });
}

export function updateCategory(
  id: number,
  body: { name: string | Record<string, string>; slug?: string; parent_id?: number | null },
) {
  return adminApiSend<PlatformCategory>(`${base}/categories/${id}`, { method: "PUT", body });
}

/** Перемещение узла дерева: новый родитель и позиция среди сиблингов. */
export function moveCategory(id: number, body: { parent_id?: number | null; position?: number }) {
  return adminApiSend<PlatformCategory>(`${base}/categories/${id}/move`, {
    method: "POST",
    body,
  });
}

export function deleteCategory(id: number) {
  return adminApiSend<void>(`${base}/categories/${id}`, { method: "DELETE" });
}

export type SeoSubjectType = "post" | "page" | "category";

export function getSeo(type: SeoSubjectType, id: number | string) {
  return adminApiGet<PlatformSeo>(`${base}/seo/${type}/${id}`);
}

export function updateSeo(type: SeoSubjectType, id: number | string, body: PlatformSeo) {
  return adminApiSend<PlatformSeo>(`${base}/seo/${type}/${id}`, { method: "PUT", body });
}
