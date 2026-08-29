import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import type { Article } from "@/lib/admin/mocks/magazine";
import {
  createStoredArticle,
  deleteStoredArticle,
  readStoredArticles,
  updateStoredArticle,
} from "@/lib/admin/articles/store";
import {
  adminMutations,
  getAdminArticleBySlug,
  getAdminArticles,
} from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { getArticlesCapabilities } from "./capabilities";

export { getArticlesCapabilities };

function toArticleBody(data: BlogFormValues) {
  return {
    title: data.title,
    subtitle: data.subtitle,
    category: data.category,
    categoryIds: data.categoryIds,
    tags: data.tags,
    authorName: data.authorName,
    authorRole: data.authorRole,
    readingTimeMin: data.readingTimeMin,
    banner: data.banner,
    thumbnail: data.thumbnail,
    coverMediaId: data.coverMediaId ?? null,
    bannerMediaId: data.bannerMediaId ?? null,
    contentBlocks: data.contentBlocks,
  };
}

export async function listArticles(): Promise<Article[]> {
  if (!shouldUseAdminApi()) {
    return readStoredArticles();
  }
  return getAdminArticles();
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!shouldUseAdminApi()) {
    return (
      readStoredArticles().find((article) => article.slug.toLowerCase() === slug.toLowerCase()) ??
      null
    );
  }
  return getAdminArticleBySlug(slug);
}

export async function createArticle(data: BlogFormValues): Promise<Article | void> {
  if (shouldUseAdminApi()) {
    await adminMutations.createArticle(toArticleBody(data));
    return;
  }
  return createStoredArticle(data);
}

export async function updateArticle(
  id: string,
  data: BlogFormValues,
): Promise<Article | null | void> {
  if (shouldUseAdminApi()) {
    await adminMutations.updateArticle(id, toArticleBody(data));
    return;
  }
  return updateStoredArticle(id, data);
}

/** Удаление поста: платформа удаляет его вместе с SEO, ревизиями и связями. */
export async function deleteArticle(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.deleteArticle(id);
    return;
  }
  deleteStoredArticle(id);
}

/** Смена статуса поста; допустимость перехода решает платформа. */
export async function changeArticleStatus(id: string, status: string): Promise<void> {
  if (!shouldUseAdminApi()) return;
  await adminMutations.changeArticleStatus(id, status);
}

export type ArticleRevision = { id: string; createdAt: string | null };

export async function listArticleRevisions(id: string): Promise<ArticleRevision[]> {
  if (!shouldUseAdminApi()) return [];
  const revisions = await adminMutations.listArticleRevisions(id);
  return revisions.map((revision) => ({
    id: String(revision.id),
    createdAt: revision.created_at ?? null,
  }));
}

export async function restoreArticleRevision(id: string, revisionId: string): Promise<void> {
  await adminMutations.restoreArticleRevision(id, revisionId);
}
