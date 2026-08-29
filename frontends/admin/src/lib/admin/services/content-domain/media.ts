import { adminMutations } from "@/lib/admin/data-source/admin-data";

/** Медиатека проекта: файл попадает в хранилище и дальше живёт как ссылка платформы. */

export type ProjectMedia = {
  id: number;
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

export async function uploadProjectMedia(
  file: File,
  alt?: string,
): Promise<ProjectMedia> {
  const media = await adminMutations.uploadMedia(file, alt);
  return { id: media.id, url: media.url, alt: media.alt ?? null };
}

/** Импорт по внешней ссылке: платформа скачивает файл в хранилище проекта. */
export async function importProjectMedia(
  url: string,
  alt?: string,
): Promise<ProjectMedia> {
  const media = await adminMutations.importMedia(url, alt);
  return { id: media.id, url: media.url, alt: media.alt ?? null };
}

/** Подбор изображений: сама выдача ничего не сохраняет. */
export async function searchProjectImages(
  query: string,
  limit?: number,
): Promise<ImageSearchResult[]> {
  const results = await adminMutations.searchImages(query, limit);
  return results.map((result) => ({
    link: result.link,
    thumbnail: result.thumbnail ?? null,
    width: result.width ?? null,
    height: result.height ?? null,
    source: result.source ?? null,
  }));
}
