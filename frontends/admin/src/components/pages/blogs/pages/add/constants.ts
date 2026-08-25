import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import type { Article } from "@/lib/admin/mocks/magazine";

export const CATEGORY_OPTIONS = [
  { value: "Rituals", label: "Rituals" },
  { value: "Ingredients", label: "Ingredients" },
  { value: "Science", label: "Science" },
  { value: "Wellness", label: "Wellness" },
  { value: "Trends", label: "Trends" },
];

export const LAYOUT_OPTIONS = [
  { value: "minimalist", label: "Minimalist" },
  { value: "editorial", label: "Editorial" },
  { value: "botanical", label: "Botanical" },
];

export const BLOCK_TYPE_OPTIONS = [
  { value: "heading", label: "Heading" },
  { value: "paragraph", label: "Paragraph" },
  { value: "quote", label: "Quote" },
  { value: "image", label: "Image" },
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
