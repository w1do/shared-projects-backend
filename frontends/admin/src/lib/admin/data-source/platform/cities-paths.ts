/**
 * Чистые построители путей раздела городов — без зависимостей, чтобы работать
 * и в node-тестах (как pay-paths и seo-catalog-paths).
 */

const CITIES_BASE = "/api/admin/v1/projects/{project}/content/cities";

export type CitySort = "population" | "name";
export type CityDirection = "asc" | "desc";

export type CityFilters = {
  search?: string;
  regionId?: number;
  enabled?: boolean;
  sort?: CitySort;
  direction?: CityDirection;
  cursor?: string;
};

export function citiesPath(filters: CityFilters = {}): string {
  const query = Object.entries({
    search: filters.search,
    region_id:
      filters.regionId === undefined ? undefined : String(filters.regionId),
    enabled:
      filters.enabled === undefined ? undefined : filters.enabled ? "1" : "0",
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

  return query ? `${CITIES_BASE}?${query}` : CITIES_BASE;
}

export function cityRegionsPath(): string {
  return `${CITIES_BASE}/regions`;
}

export function cityPath(id: number): string {
  return `${CITIES_BASE}/${id}`;
}

export function citiesEnableAllPath(): string {
  return `${CITIES_BASE}/enable-all`;
}

export function citiesResetPath(): string {
  return `${CITIES_BASE}/reset`;
}

export function citySeoPath(id: number): string {
  return `${CITIES_BASE}/${id}/seo`;
}

export function citiesAdaptSeoPath(): string {
  return `${CITIES_BASE}/adapt-seo`;
}
