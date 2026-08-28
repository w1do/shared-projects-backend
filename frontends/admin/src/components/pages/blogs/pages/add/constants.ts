import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import type { Article } from "@/lib/admin/mocks/magazine";
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

export const BLOCK_TYPE_OPTIONS = [
  { value: "heading", label: t("console.blogs.form.block-type.heading") },
  { value: "paragraph", label: t("console.blogs.form.block-type.paragraph") },
  { value: "quote", label: t("console.blogs.form.block-type.quote") },
  { value: "image", label: t("console.blogs.form.block-type.image") },
];

export const blogFormDefaults: BlogFormValues = {
  title: "",
  subtitle: "",
  category: "Rituals",
  categoryIds: [],
  tags: "",
  authorName: "",
  authorRole: "",
  authorAvatar: "",
  readingTimeMin: 5,
  banner: "",
  thumbnail: "",
  layoutStyle: "editorial",
  contentBlocks: [{ type: "paragraph", content: "" }],
};

type FormContentBlock = BlogFormValues["contentBlocks"][number];

/** Map a stored article's rich content blocks onto the editable form blocks. */
function toFormBlocks(article: Article): FormContentBlock[] {
  const blocks: FormContentBlock[] = [];
  for (const block of article.contentBlocks) {
    if (block.type === "heading" || block.type === "paragraph" || block.type === "quote") {
      blocks.push({ type: block.type, content: block.content });
    } else if (block.type === "image_full") {
      blocks.push({ type: "image", content: block.url });
    } else if (block.type === "image_grid") {
      blocks.push({ type: "image", content: block.images[0] ?? "" });
    }
  }
  return blocks.length > 0 ? blocks : [{ type: "paragraph", content: "" }];
}

/** Convert a stored article into editable form values. */
export function articleToFormValues(article: Article): BlogFormValues {
  return {
    title: article.title,
    subtitle: article.subtitle,
    category: article.category,
    categoryIds: article.categoryIds ?? [],
    tags: article.tags.join(", "),
    authorName: article.author.name,
    authorRole: article.author.role,
    authorAvatar: article.author.avatar,
    readingTimeMin: article.readingTimeMin,
    banner: article.banner,
    thumbnail: article.thumbnail,
    layoutStyle: (article.layoutStyle as BlogFormValues["layoutStyle"]) ?? "editorial",
    contentBlocks: toFormBlocks(article),
  };
}
