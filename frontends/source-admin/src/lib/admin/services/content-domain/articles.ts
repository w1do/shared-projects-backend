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
    tags: data.tags,
    authorName: data.authorName,
    authorRole: data.authorRole,
    readingTimeMin: data.readingTimeMin,
    banner: data.banner,
    thumbnail: data.thumbnail,
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

export async function deleteArticle(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    // No delete endpoint in template API surface — no-op.
    return;
  }
  deleteStoredArticle(id);
}
