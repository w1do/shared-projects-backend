/** Типы материалов блога: пост, его блоки и предпросмотр статьи. */
export interface ArticleAuthor {
  name: string;
  avatar: string;
  role: string;
}

export type ContentBlockType =
  | "paragraph"
  | "heading"
  | "image_full"
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
  status?: "draft" | "scheduled" | "published" | "archived";
  /** Категории проекта, к которым привязан пост. */
  categoryIds?: string[];
  /** Закреплённый пост: в проекте он один и показывается карточкой над списком. */
  isFeatured?: boolean;
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
  /** Медиа проекта за изображениями поста. */
  coverMediaId?: number | null;
  bannerMediaId?: number | null;
  layoutStyle: "minimalist" | "editorial" | "botanical" | string;
  contentBlocks: ContentBlock[];
  /** Содержимое блоками: источник правды для формы поста. */
  blocks?: ArticleBlock[];
}
