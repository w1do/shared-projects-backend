/**
 * Каталог SEO: список записей проекта и запуск пересбора полей по AI.
 * Правка отдельной записи остаётся в `seo.ts`.
 */

import * as platformSeoCatalog from "@/lib/admin/data-source/platform/seo-catalog";

export type {
  PlatformSeoCatalogItem,
  SeoCatalogFilters,
  SeoDirection,
  SeoRebuildTarget,
  SeoSort,
} from "@/lib/admin/data-source/platform/seo-catalog";

export const seoCatalog = {
  list: (filters?: platformSeoCatalog.SeoCatalogFilters) =>
    platformSeoCatalog.getSeoCatalog(filters),
  rebuild: (entities: platformSeoCatalog.SeoRebuildTarget[]) =>
    platformSeoCatalog.startSeoRebuild(entities),
};
