import { mapArticle } from "../mappers";
import * as platformContent from "../platform/content";
import { categoryNameIndex, postToArticle } from "../platform/mappers";

/** blogs → content-service: посты проекта. */
export async function getAdminArticles() {
  const [posts, tree] = await Promise.all([
    platformContent.listPosts(),
    platformContent.listCategories(),
  ]);
  const names = categoryNameIndex(tree);
  return posts.map((post) => mapArticle(postToArticle(post, names)));
}

export async function getAdminArticleBySlug(slug: string) {
  const [posts, tree] = await Promise.all([
    platformContent.listPosts(),
    platformContent.listCategories(),
  ]);
  const names = categoryNameIndex(tree);
  const post = posts.find(
    (item) => item.slug.toLowerCase() === slug.toLowerCase() || String(item.id) === slug,
  );
  if (!post) return null;

  // Детальный ответ несёт seo и категории — берём его для полной карточки.
  const full = await platformContent.getPost(post.id);
  return mapArticle(postToArticle(full, names));
}

/** Ревизии поста — история изменений раздела blogs. */
export async function getAdminArticleRevisions(id: string) {
  return platformContent.listPostRevisions(Number(id));
}
