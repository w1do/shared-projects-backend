/**
 * SEO-метаданные контента (content-service): чтение и сохранение, включая JSON-LD.
 *
 * В вёрстке нет отдельной SEO-формы для постов и категорий, поэтому поля,
 * которые форма поста всё же несёт (заголовок, подзаголовок, теги, обложка),
 * пишутся в SEO при сохранении поста; остальные поля доступны здесь.
 */

import * as platformContent from "@/lib/admin/data-source/platform/content";
import type { PlatformSeo } from "@/lib/admin/data-source/platform/types";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";

export type SeoSubjectType = platformContent.SeoSubjectType;
export type SeoMeta = PlatformSeo;

const emptySeo: SeoMeta = {
  title: null,
  description: null,
  keywords: null,
  canonical: null,
  robots: null,
  og_title: null,
  og_description: null,
  og_image: null,
  twitter_card: null,
  json_ld: null,
};

export async function getSeo(type: SeoSubjectType, id: string | number): Promise<SeoMeta> {
  if (!shouldUseAdminApi()) return emptySeo;
  return platformContent.getSeo(type, id);
}

export async function saveSeo(
  type: SeoSubjectType,
  id: string | number,
  meta: SeoMeta,
): Promise<SeoMeta> {
  if (!shouldUseAdminApi()) return meta;
  return platformContent.updateSeo(type, id, meta);
}
