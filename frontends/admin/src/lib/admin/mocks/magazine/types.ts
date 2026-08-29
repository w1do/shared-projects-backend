/**
 * Beauty Journal (magazine) content types. Product references use product ids
 * (slugs) so they resolve against the catalog once the UI is built.
 */
export interface ArticleAuthor {
  name: string;
  avatar: string;
  role: string;
}

export type ContentBlockType =
  | "paragraph"
  | "heading"
  | "image_full"
  | "product_card"
  | "quote"
  | "image_grid";

export interface ParagraphBlock {
  type: "paragraph";
  content: string;
}

export interface HeadingBlock {
  type: "heading";
  level: number;
  content: string;
}

export interface ImageFullBlock {
  type: "image_full";
  url: string;
  caption?: string;
  effect?: string;
}

export interface ProductCardBlock {
  type: "product_card";
  product_id: string;
  display_mode: string;
  caption?: string;
}

export interface QuoteBlock {
  type: "quote";
  content: string;
  author: string;
  style: string;
}

export interface ImageGridBlock {
  type: "image_grid";
  images: string[];
  caption?: string;
  url?: string;
}

export type ContentBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageFullBlock
  | ProductCardBlock
  | QuoteBlock
  | ImageGridBlock;

/** Блок содержимого поста: название и текст в markdown. */
export interface ArticleBlock {
  /** Идентификатор платформы; у нового блока его ещё нет. */
  id?: string;
  title: string;
  markdown: string;
}

export interface Article {
  id: string;
  /** Статус поста платформы; отсутствует у демо-данных вёрстки. */
  status?: "draft" | "scheduled" | "published" | "archived";
  /** Категории проекта, к которым привязан пост (режим api). */
  categoryIds?: string[];
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  tags: string[];
  author: ArticleAuthor;
  publishedAt: string;
  readingTimeMin: number;
  banner: string;
  thumbnail: string;
  /** Медиа проекта за изображениями поста (режим api). */
  coverMediaId?: number | null;
  bannerMediaId?: number | null;
  layoutStyle: "minimalist" | "editorial" | "botanical" | string;
  relatedProducts: string[];
  contentBlocks: ContentBlock[];
  /** Содержимое блоками (режим api): источник правды для формы поста. */
  blocks?: ArticleBlock[];
}
