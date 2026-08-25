import { z } from "zod";

export const BrandSchema = z.object({
  id: z.string(),
  name: z.string(),
  monogram: z.string(),
  revenue: z.number(),
  share: z.number(),
  trend: z.array(z.number()),
  delta: z.number(),
});
export type Brand = z.infer<typeof BrandSchema>;

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  sku: string;
  price: number;
  unitsSold: number;
  revenue: number;
  gradient: [string, string];
  image?: string;
  stock?: number;
  discount?: number;
};

export type Order = {
  id: string;
  customer: { name: string; initials: string; avatarUrl?: string };
  items: string;
  itemCount: number;
  status: "Paid" | "Processing" | "Shipped" | "Refunded" | "Pending";
  total: number;
  placedAt: string;
};

export type LowStock = {
  id: string;
  name: string;
  brand: string;
  sku: string;
  unitsLeft: number;
  threshold: number;
  image?: string;
};

export type Campaign = {
  id: string;
  name: string;
  channel: string;
  roas: number;
  conversions: number;
  cap: number;
  spend: number;
  description?: string;
  status?: "Active" | "Scheduled" | "Completed" | "Draft";
  budget?: number;
  revenue?: number;
  views?: number;
  startsAt?: string;
  endsAt?: string;
  promotionIds?: string[];
  collectionIds?: string[];
  banner?: string;
  thumbnail?: string;
  performanceTrend?: number[];
};

export type ProductContentBlock = {
  id: string;
  title: string;
  slug: string;
  displayType: "text" | "rich_text" | "list" | "table" | "faq_accordion" | "cards" | "key_value";
  content?: unknown;
  isVisible: boolean;
  position: number;
};

export type ProductFull = Product & {
  status: "Active" | "Draft" | "Archived";
  stock: number;
  stockStatus: "In Stock" | "Low Stock" | "Out of Stock";
  updatedAt: string;
  createdAt: string;
  variants: number;
  description?: string;
  shortDescription?: string;
  images?: string[];
  contentBlocks?: ProductContentBlock[];
  weight?: number;
  collections?: string[];
};

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  productCount: z.number(),
  status: z.enum(["Active", "Draft", "Archived"]),
  /** Родитель в дереве категорий; null — корневой узел. */
  parentId: z.string().nullable().optional(),
  /** Имя по локалям проекта (режим api). */
  nameTranslations: z.record(z.string(), z.string()).optional(),
  /** Уровень вложенности: 0 — корень. Нужен только для отступа в списке. */
  depth: z.number().optional(),
  coverGradient: z.tuple([z.string(), z.string()]),
  /** Square thumbnail image URL (1:1). */
  thumbnail: z.string(),
  iconName: z.string().optional(),
  revenue: z.number(),
  growthYoY: z.number(),
  displayOrder: z.number(),
  createdAt: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

export const CollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  productCount: z.number(),
  status: z.enum(["Active", "Draft", "Archived"]),
  /** Wide banner image URL (16:9). */
  banner: z.string(),
  /** Square thumbnail image URL (1:1). */
  thumbnail: z.string(),
  revenue: z.number(),
  views: z.number(),
  growthYoY: z.number(),
  viewTrend: z.array(z.number()).optional(),
  featured: z.boolean(),
  products: z.array(z.string()),
  productItems: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        brand: z.string(),
        price: z.number(),
        image: z.string().optional(),
        gradient: z.tuple([z.string(), z.string()]),
      }),
    )
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Collection = z.infer<typeof CollectionSchema>;

export const InventoryItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  name: z.string(),
  sku: z.string(),
  brand: z.string(),
  stock: z.number(),
  incoming: z.number(),
  threshold: z.number(),
  location: z.string(),
  stockStatus: z.enum(["In Stock", "Low Stock", "Out of Stock"]),
  price: z.number(),
  image: z.string().optional(),
  updatedAt: z.string(),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;
