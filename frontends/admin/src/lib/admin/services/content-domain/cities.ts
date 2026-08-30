/** Города проекта: состав, SEO города и запуск AI-адаптации. */

import * as platformCities from "@/lib/admin/data-source/platform/cities";
import type { PlatformSeo } from "@/lib/admin/data-source/platform/types";

export type {
  CityDirection,
  CityFilters,
  CitySort,
  PlatformCity,
  PlatformCityBulkResult,
  PlatformRegion,
} from "@/lib/admin/data-source/platform/cities";

export const cities = {
  list: (filters?: platformCities.CityFilters) =>
    platformCities.getCities(filters),
  regions: () => platformCities.getCityRegions(),
  setEnabled: (id: number, enabled: boolean) =>
    platformCities.setCityEnabled(id, enabled),
  enableAll: () => platformCities.enableAllCities(),
  reset: () => platformCities.resetCitiesToStarter(),
  seo: (id: number) => platformCities.getCitySeo(id),
  saveSeo: (id: number, meta: PlatformSeo) =>
    platformCities.saveCitySeo(id, meta),
  adaptSeo: (topic?: string) => platformCities.startCitySeoAdaptation(topic),
};
