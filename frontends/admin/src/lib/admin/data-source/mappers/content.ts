import type { Article, ContentBlock } from "@/lib/admin/types/magazine";
import type { ApiArticle } from "../api-types";

export function mapArticle(article: ApiArticle): Article {
  const contentBlocks: ContentBlock[] =
    article.contentBlocks?.map((block) => {
      if (block.type === "image") {
        return { type: "image_full" as const, url: block.content ?? block.url ?? "" };
      }
      if (block.type === "heading") {
        return { type: "heading" as const, level: 2, content: block.content ?? "" };
      }
      if (block.type === "quote") {
        return {
          type: "quote" as const,
          content: block.content ?? "",
          author: "Aetheria Editorial",
          style: "pull",
        };
      }
      return {
        type: "paragraph" as const,
        content: block.content ?? "",
      };
    }) ?? [];

  return {
    id: article.id,
    status: article.status.toLowerCase() as Article["status"],
    categoryIds: article.categoryIds ?? [],
    slug: article.slug,
    title: article.title,
    subtitle: article.subtitle ?? "",
    category: article.category ?? "Journal",
    tags: article.tags ?? [],
    author: {
      name: article.authorName ?? "Aetheria Editorial",
      role: "Editor",
      avatar: "AE",
    },
    readingTimeMin: article.readingTimeMin,
    publishedAt: article.publishedAt ?? article.createdAt ?? new Date().toISOString(),
    banner: article.banner ?? article.thumbnail ?? "",
    thumbnail: article.thumbnail ?? article.banner ?? "",
    blocks: (article.blocks ?? []).map((block) => ({
      id: block.id,
      title: block.title ?? "",
      markdown: block.markdown ?? "",
    })),
    coverMediaId: article.coverMediaId ?? null,
    bannerMediaId: article.bannerMediaId ?? null,
    layoutStyle: "editorial",
    contentBlocks,
  };
}
