/** content-service: категории, медиа и SEO. Пути скоупятся текущим проектом. */

import {
  adminApiGet,
  adminApiGetPage,
  adminApiSend,
  adminApiUpload,
} from "../api-client";
import type {
  PlatformCategory,
  PlatformImageResult,
  PlatformMedia,
  PlatformSeo,
} from "./types";

export * from "./content-posts";

const base = "/api/admin/v1/projects/{project}/content";

export function listCategories() {
  return adminApiGet<PlatformCategory[]>(`${base}/categories`);
}

export function createCategory(body: {
  name: string | Record<string, string>;
  slug?: string;
  parent_id?: number | null;
}) {
  return adminApiSend<PlatformCategory>(`${base}/categories`, {
    method: "POST",
    body,
  });
}

export function updateCategory(
  id: number,
  body: {
    name: string | Record<string, string>;
    slug?: string;
    parent_id?: number | null;
  },
) {
  return adminApiSend<PlatformCategory>(`${base}/categories/${id}`, {
    method: "PUT",
    body,
  });
}

/** Перемещение узла дерева: новый родитель и позиция среди сиблингов. */
export function moveCategory(
  id: number,
  body: { parent_id?: number | null; position?: number },
) {
  return adminApiSend<PlatformCategory>(`${base}/categories/${id}/move`, {
    method: "POST",
    body,
  });
}

export function deleteCategory(id: number) {
  return adminApiSend<void>(`${base}/categories/${id}`, { method: "DELETE" });
}

/**
 * Массовое удаление одним запросом: платформа выполняет его одной транзакцией.
 * Серия одиночных DELETE пересчитывала бы границы дерева на каждом шаге.
 */
export function bulkDeleteCategories(ids: number[]) {
  return adminApiSend<void>(`${base}/categories/bulk-delete`, {
    method: "POST",
    body: { ids },
  });
}

/** Очистка каталога проекта: платформа удаляет дерево без обхода из консоли. */
export function purgeCategories() {
  return adminApiSend<void>(`${base}/categories`, { method: "DELETE" });
}

export function listMedia() {
  return adminApiGetPage<PlatformMedia>(`${base}/media`).then(
    (page) => page.items,
  );
}

/** Загрузка файла в медиатеку проекта — multipart, поэтому мимо adminApiSend. */
export function uploadMedia(file: File, alt?: string) {
  const form = new FormData();
  form.append("file", file);
  if (alt) form.append("alt", alt);

  return adminApiUpload<PlatformMedia>(`${base}/media`, form);
}

/** Импорт изображения по внешней ссылке: платформа скачивает файл в своё хранилище. */
export function importMedia(url: string, alt?: string) {
  return adminApiSend<PlatformMedia>(`${base}/media/import`, {
    method: "POST",
    body: alt ? { url, alt } : { url },
  });
}

/** Подбор изображений во внешней поисковой службе; ничего не сохраняет. */
export function searchImages(query: string, limit?: number) {
  const params = new URLSearchParams({ query });
  if (limit != null) params.set("limit", String(limit));

  return adminApiGet<PlatformImageResult[]>(
    `${base}/images/search?${params.toString()}`,
  );
}

export type SeoSubjectType = "post" | "page" | "category";

export function getSeo(type: SeoSubjectType, id: number | string) {
  return adminApiGet<PlatformSeo>(`${base}/seo/${type}/${id}`);
}

export function updateSeo(
  type: SeoSubjectType,
  id: number | string,
  body: PlatformSeo,
) {
  return adminApiSend<PlatformSeo>(`${base}/seo/${type}/${id}`, {
    method: "PUT",
    body,
  });
}
