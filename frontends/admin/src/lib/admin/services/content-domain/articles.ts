import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import type { Article } from "@/lib/admin/types/magazine";
import {
  adminMutations,
  getAdminArticleBySlug,
  getAdminArticles,
} from "@/lib/admin/data-source/admin-data";

function toArticleBody(data: BlogFormValues) {
  return {
    title: data.title,
    subtitle: data.subtitle,
    category: data.category,
    categoryIds: data.categoryIds,
    tags: data.tags,
    readingTimeMin: data.readingTimeMin,
    banner: data.banner,
    thumbnail: data.thumbnail,
    coverMediaId: data.coverMediaId ?? null,
    bannerMediaId: data.bannerMediaId ?? null,
    blocks: data.contentBlocks.map((block) => ({
      ...(block.id ? { id: block.id } : {}),
      title: block.title ?? "",
      markdown: block.markdown,
    })),
  };
}

export async function listArticles(): Promise<Article[]> {
  return getAdminArticles();
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  return getAdminArticleBySlug(slug);
}

export async function createArticle(data: BlogFormValues): Promise<void> {
  await adminMutations.createArticle(toArticleBody(data));
}

export async function updateArticle(id: string, data: BlogFormValues): Promise<void> {
  await adminMutations.updateArticle(id, toArticleBody(data));
}

/** Удаление поста: платформа удаляет его вместе с SEO, ревизиями и связями. */
export async function deleteArticle(id: string): Promise<void> {
  await adminMutations.deleteArticle(id);
}

/** Смена статуса поста; допустимость перехода решает платформа. */
export async function changeArticleStatus(id: string, status: string): Promise<void> {
  await adminMutations.changeArticleStatus(id, status);
}

export type ArticleRevision = { id: string; createdAt: string | null };

export async function listArticleRevisions(id: string): Promise<ArticleRevision[]> {
  const revisions = await adminMutations.listArticleRevisions(id);
  return revisions.map((revision) => ({
    id: String(revision.id),
    createdAt: revision.created_at ?? null,
  }));
}

export async function restoreArticleRevision(id: string, revisionId: string): Promise<void> {
  await adminMutations.restoreArticleRevision(id, revisionId);
}
