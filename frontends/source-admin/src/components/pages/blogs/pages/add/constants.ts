import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import type { Article } from "@/lib/admin/types/magazine";
import { t } from "@/lib/admin/console-texts";

// Значения option — стабильные данные (хранятся в статье и участвуют в
// сравнениях), переводятся только подписи.
export const CATEGORY_OPTIONS = [
  { value: "Rituals", label: t("console.blogs.form.category.rituals") },
  { value: "Ingredients", label: t("console.blogs.form.category.ingredients") },
  { value: "Science", label: t("console.blogs.form.category.science") },
  { value: "Wellness", label: t("console.blogs.form.category.wellness") },
  { value: "Trends", label: t("console.blogs.form.category.trends") },
];

export const LAYOUT_OPTIONS = [
  { value: "minimalist", label: t("console.blogs.form.layout.minimalist") },
  { value: "editorial", label: t("console.blogs.form.layout.editorial") },
  { value: "botanical", label: t("console.blogs.form.layout.botanical") },
];

export const blogFormDefaults: BlogFormValues = {
  title: "",
  subtitle: "",
  category: "Rituals",
  categoryIds: [],
  tags: "",
  readingTimeMin: 5,
  banner: "",
  thumbnail: "",
  layoutStyle: "editorial",
  isFeatured: false,
  contentBlocks: [],
};

type FormContentBlock = BlogFormValues["contentBlocks"][number];

/**
 * Содержимое поста для формы.
 *
 * В режиме api источник правды — блоки платформы: у них есть идентификаторы,
 * которые надо вернуть обратно. Демо-данные вёрстки блоков не имеют, поэтому
 * их богатые блоки сводятся к тексту.
 */
function toFormBlocks(article: Article): FormContentBlock[] {
  if (article.blocks && article.blocks.length > 0) {
    return article.blocks.map((block) => ({
      id: block.id,
      title: block.title ?? "",
      markdown: block.markdown ?? "",
    }));
  }

  const blocks: FormContentBlock[] = [];

  for (const block of article.contentBlocks) {
    if (block.type === "heading" || block.type === "paragraph" || block.type === "quote") {
      blocks.push({ title: "", markdown: block.content });
    } else if (block.type === "image_full") {
      blocks.push({ title: "", markdown: `![](${block.url})` });
    } else if (block.type === "image_grid") {
      blocks.push({ title: "", markdown: `![](${block.images[0] ?? ""})` });
    }
  }

  return blocks;
}

/** Convert a stored article into editable form values. */
export function articleToFormValues(article: Article): BlogFormValues {
  return {
    title: article.title,
    subtitle: article.subtitle,
    category: article.category,
    categoryIds: article.categoryIds ?? [],
    tags: article.tags.join(", "),
    readingTimeMin: article.readingTimeMin,
    banner: article.banner,
    thumbnail: article.thumbnail,
    coverMediaId: article.coverMediaId ?? null,
    bannerMediaId: article.bannerMediaId ?? null,
    layoutStyle: (article.layoutStyle as BlogFormValues["layoutStyle"]) ?? "editorial",
    isFeatured: article.isFeatured ?? false,
    contentBlocks: toFormBlocks(article),
  };
}
