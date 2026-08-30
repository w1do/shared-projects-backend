/** Каталог SEO проекта: список записей по сущностям и запуск AI-пересбора. */

import { adminApiSend } from "../api-client";
import { getCursorPage } from "./cursor-page";
import {
  seoCatalogPath,
  seoRebuildPath,
  type SeoCatalogFilters,
  type SeoRebuildTarget,
} from "./seo-catalog-paths";
import type { SeoSubjectType } from "./content";
import type { PlatformSeo } from "./types";
import type { PlatformTask } from "./tasks";

export * from "./seo-catalog-paths";

export type PlatformSeoCatalogItem = {
  type: SeoSubjectType;
  entity_id: number;
  entity_title: string;
  filled: boolean;
  updated_at: string | null;
  seo: PlatformSeo;
};

export function getSeoCatalog(filters: SeoCatalogFilters = {}) {
  return getCursorPage<PlatformSeoCatalogItem>(seoCatalogPath(filters));
}

export function startSeoRebuild(entities: SeoRebuildTarget[]) {
  return adminApiSend<PlatformTask>(seoRebuildPath(), {
    method: "POST",
    body: { entities },
  });
}
