/**
 * Чистые построители путей каталога SEO — без зависимостей, чтобы работать
 * и в node-тестах (как pay-paths и licensing-paths).
 */
import type { SeoSubjectType } from "./content";

const SEO_BASE = "/api/admin/v1/projects/{project}/content/seo";

export type SeoSort = "type" | "title" | "updated_at";
export type SeoDirection = "asc" | "desc";

export type SeoCatalogFilters = {
  type?: SeoSubjectType;
  sort?: SeoSort;
  direction?: SeoDirection;
  cursor?: string;
};

/** Сущности пересборки: пустой список — весь проект. */
export type SeoRebuildTarget = { type: SeoSubjectType; id: number };

export function seoCatalogPath(filters: SeoCatalogFilters = {}): string {
  const query = Object.entries({
    type: filters.type,
    sort: filters.sort,
    direction: filters.direction,
    cursor: filters.cursor,
  })
    .filter(
      (entry): entry is [string, string] =>
        entry[1] !== undefined && entry[1] !== "",
    )
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return query ? `${SEO_BASE}?${query}` : SEO_BASE;
}

export function seoRebuildPath(): string {
  return `${SEO_BASE}/rebuild`;
}
