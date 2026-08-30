/** Города проекта: справочник платформы с включённостью, SEO и AI-адаптацией. */

import { adminApiGet, adminApiSend } from "../api-client";
import {
  citiesAdaptSeoPath,
  citiesEnableAllPath,
  citiesPath,
  citiesResetPath,
  cityPath,
  cityRegionsPath,
  citySeoPath,
  type CityFilters,
} from "./cities-paths";
import { getCursorPage } from "./cursor-page";
import type { PlatformTask } from "./tasks";
import type { PlatformSeo } from "./types";

export * from "./cities-paths";

export type PlatformCity = {
  id: number;
  name: string;
  slug: string;
  region_id: number;
  region_name: string;
  federal_district: string | null;
  population: number;
  enabled: boolean;
  has_seo: boolean;
};

export type PlatformRegion = {
  id: number;
  name: string;
  federal_district: string | null;
};

/** Итог массового действия: сколько городов осталось включёнными. */
export type PlatformCityBulkResult = { enabled: number };

export function getCities(filters: CityFilters = {}) {
  return getCursorPage<PlatformCity>(citiesPath(filters));
}

export function getCityRegions() {
  return adminApiGet<PlatformRegion[]>(cityRegionsPath());
}

export function setCityEnabled(id: number, enabled: boolean) {
  return adminApiSend<PlatformCity>(cityPath(id), {
    method: "PUT",
    body: { enabled },
  });
}

export function enableAllCities() {
  return adminApiSend<PlatformCityBulkResult>(citiesEnableAllPath(), {
    method: "POST",
  });
}

export function resetCitiesToStarter() {
  return adminApiSend<PlatformCityBulkResult>(citiesResetPath(), {
    method: "POST",
  });
}

export function getCitySeo(id: number) {
  return adminApiGet<PlatformSeo | null>(citySeoPath(id));
}

export function saveCitySeo(id: number, body: PlatformSeo) {
  return adminApiSend<PlatformSeo>(citySeoPath(id), { method: "PUT", body });
}

/** Запуск адаптации SEO включённых городов; без тематики берётся тематика проекта. */
export function startCitySeoAdaptation(topic?: string) {
  return adminApiSend<PlatformTask>(citiesAdaptSeoPath(), {
    method: "POST",
    body: topic === undefined ? {} : { topic },
  });
}
