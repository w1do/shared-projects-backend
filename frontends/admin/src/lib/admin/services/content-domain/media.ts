import { adminMutations } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";

/**
 * Медиатека проекта.
 *
 * В режиме api файл всегда попадает в хранилище проекта и дальше живёт как
 * ссылка платформы. В mock-режиме платформы нет вовсе, поэтому изображение
 * остаётся data URL — ровно как до появления медиа-API.
 */

export type ProjectMedia = {
  /** Идентификатор медиа платформы; `null` в mock-режиме. */
  id: number | null;
  url: string;
  alt: string | null;
};

export type ImageSearchResult = {
  link: string;
  thumbnail: string | null;
  width: number | null;
  height: number | null;
  source: string | null;
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onloadend = () =>
      typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

export async function uploadProjectMedia(file: File, alt?: string): Promise<ProjectMedia> {
  if (!shouldUseAdminApi()) {
    return { id: null, url: await readAsDataUrl(file), alt: alt ?? null };
  }

  const media = await adminMutations.uploadMedia(file, alt);
  return { id: media.id, url: media.url, alt: media.alt ?? null };
}

/** Импорт по внешней ссылке: платформа скачивает файл в хранилище проекта. */
export async function importProjectMedia(url: string, alt?: string): Promise<ProjectMedia> {
  if (!shouldUseAdminApi()) {
    return { id: null, url, alt: alt ?? null };
  }

  const media = await adminMutations.importMedia(url, alt);
  return { id: media.id, url: media.url, alt: media.alt ?? null };
}

/** Подбор изображений: сама выдача ничего не сохраняет. */
export async function searchProjectImages(
  query: string,
  limit?: number,
): Promise<ImageSearchResult[]> {
  if (!shouldUseAdminApi()) return [];

  const results = await adminMutations.searchImages(query, limit);
  return results.map((result) => ({
    link: result.link,
    thumbnail: result.thumbnail ?? null,
    width: result.width ?? null,
    height: result.height ?? null,
    source: result.source ?? null,
  }));
}
