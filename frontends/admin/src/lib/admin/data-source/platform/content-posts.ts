/** content-service: посты проекта, их версии и пересборка. */

import { adminApiGet, adminApiGetPage, adminApiSend } from "../api-client";
import type { PlatformTask } from "./tasks";
import type { PlatformPost, PlatformRevision } from "./types";

const base = "/api/admin/v1/projects/{project}/content";

export type UpsertPostBody = {
  title: string;
  slug?: string;
  body?: string | null;
  locale?: string;
  categories?: number[];
  is_index?: boolean;
  cover_media_id?: number | null;
  banner_media_id?: number | null;
};

export async function listPosts(params?: {
  status?: string;
  locale?: string;
  category?: number;
}) {
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
  return adminApiSend<PlatformPost>(`${base}/posts/${id}`, {
    method: "PUT",
    body,
  });
}

export function deletePost(id: number) {
  return adminApiSend<null>(`${base}/posts/${id}`, { method: "DELETE" });
}

export function changePostStatus(
  id: number,
  status: string,
  scheduledAt?: string,
) {
  return adminApiSend<PlatformPost>(`${base}/posts/${id}/status`, {
    method: "POST",
    body: scheduledAt ? { status, scheduled_at: scheduledAt } : { status },
  });
}

export function listPostRevisions(id: number) {
  return adminApiGet<PlatformRevision[]>(`${base}/posts/${id}/revisions`);
}

export function restorePostRevision(id: number, revisionId: number) {
  return adminApiSend<PlatformPost>(
    `${base}/posts/${id}/revisions/${revisionId}/restore`,
    {
      method: "POST",
    },
  );
}

/** Пересборка текста поста через AI: платформа отвечает задачей реестра. */
export function rebuildPost(id: number) {
  return adminApiSend<PlatformTask>(`${base}/posts/${id}/rebuild`, {
    method: "POST",
  });
}

export function deletePostRevision(id: number, revisionId: number) {
  return adminApiSend<null>(`${base}/posts/${id}/revisions/${revisionId}`, {
    method: "DELETE",
  });
}
