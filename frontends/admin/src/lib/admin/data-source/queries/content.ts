import { readStoredArticles } from "@/lib/admin/articles/store";
import { mapArticle } from "../mappers";
import * as platformContent from "../platform/content";
import { categoryNameIndex, postToArticle } from "../platform/mappers";
import { fromSource } from "./shared";

/** blogs → content-service: посты проекта. */
export async function getAdminArticles() {
  return fromSource(async () => {
    const [posts, tree] = await Promise.all([platformContent.listPosts(), platformContent.listCategories()]);
    const names = categoryNameIndex(tree);
    return posts.map((post) => mapArticle(postToArticle(post, names)));
  }, readStoredArticles);
}

export async function getAdminArticleBySlug(slug: string) {
  return fromSource(
    async () => {
      const [posts, tree] = await Promise.all([
        platformContent.listPosts(),
        platformContent.listCategories(),
      ]);
      const names = categoryNameIndex(tree);
      const post = posts.find(
        (item) =>
          item.slug.toLowerCase() === slug.toLowerCase() || String(item.id) === slug,
      );
      if (!post) return null;
      // Детальный ответ несёт seo и категории — берём его для полной карточки.
      const full = await platformContent.getPost(post.id);
      return mapArticle(postToArticle(full, names));
    },
    () =>
      readStoredArticles().find(
        (article) =>
          article.slug.toLowerCase() === slug.toLowerCase() ||
          article.id.toLowerCase() === slug.toLowerCase(),
      ) ?? null,
  );
}

/** Ревизии поста — история изменений раздела blogs. */
export async function getAdminArticleRevisions(id: string) {
  return fromSource(
    () => platformContent.listPostRevisions(Number(id)),
    () => [],
  );
}
