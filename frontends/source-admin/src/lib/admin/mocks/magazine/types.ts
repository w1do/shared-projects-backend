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

export interface Article {
  id: string;
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
  layoutStyle: "minimalist" | "editorial" | "botanical" | string;
  relatedProducts: string[];
  contentBlocks: ContentBlock[];
}
