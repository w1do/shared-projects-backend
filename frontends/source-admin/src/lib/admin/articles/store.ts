/**
 * Versioned localStorage store for blog articles (mock backend).
 */
import type { Article, ContentBlock } from "@/lib/admin/mocks/magazine";
import { mockArticles } from "@/lib/admin/mocks/magazine";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";

const seed: Article[] = [...mockArticles];
const store = createVersionedLocalStore<Article>({
  storageKey: storageKey("articles"),
  seedVersionKey: storageKey("articles-seed-version"),
  seedVersion: "1",
  seed,
});

export function readStoredArticles(): Article[] {
  return store.read();
}

export function saveStoredArticles(items: Article[]) {
  store.save(items);
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function tagsFromForm(tags?: string): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function mapContentBlocks(values: BlogFormValues): ContentBlock[] {
  // Form schema uses a simplified block model; cast to magazine ContentBlock union.
  return values.contentBlocks.map((block) => {
    if (block.type === "heading") {
      return { type: "heading", level: 2, content: block.content };
    }
    if (block.type === "quote") {
      return { type: "quote", content: block.content, author: values.authorName, style: "default" };
    }
    if (block.type === "image") {
      return { type: "image_full", url: block.content, caption: "" };
    }
    return { type: "paragraph", content: block.content };
  }) as ContentBlock[];
}

function articleFromForm(values: BlogFormValues, existing?: Article): Article {
  const id = existing?.id ?? `article-${Date.now()}`;
  const slug = existing?.slug || slugify(values.title) || id;
  return {
    id,
    slug,
    title: values.title,
    subtitle: values.subtitle,
    category: values.category,
    tags: tagsFromForm(values.tags),
    author: {
      name: values.authorName,
      role: values.authorRole,
      avatar: values.authorAvatar || existing?.author.avatar || "/avatars/user-03.webp",
    },
    publishedAt: existing?.publishedAt ?? new Date().toISOString().slice(0, 10),
    readingTimeMin: values.readingTimeMin,
    banner: values.banner || existing?.banner || "",
    thumbnail: values.thumbnail || existing?.thumbnail || "",
    layoutStyle: values.layoutStyle,
    relatedProducts: existing?.relatedProducts ?? [],
    contentBlocks: mapContentBlocks(values),
  };
}

export function createStoredArticle(values: BlogFormValues): Article {
  const article = articleFromForm(values);
  saveStoredArticles([article, ...readStoredArticles()]);
  return article;
}

export function updateStoredArticle(id: string, values: BlogFormValues): Article | null {
  const items = readStoredArticles();
  const existing = items.find((article) => article.id === id);
  if (!existing) return null;
  const updated = articleFromForm(values, existing);
  saveStoredArticles(items.map((article) => (article.id === id ? updated : article)));
  return updated;
}

export function deleteStoredArticle(id: string) {
  saveStoredArticles(readStoredArticles().filter((article) => article.id !== id));
}
