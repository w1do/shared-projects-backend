/**
 * Shared helpers and lookup maps for transforming the raw BlushNest product
 * dataset (`products.json`) into the typed catalog, variant and inventory mocks.
 */
import rawProducts from "./products.json";
import { semanticColors } from "@/lib/theme-colors";

export interface SourceVariantDimension {
  name: string;
  values: (string | number | boolean)[];
}

export interface SourceVariantCatalogItem {
  id: number;
  sku: string;
  price: number;
  stock_quantity: number;
  status: string;
  currency?: string;
  discount_percentage?: number;
  options: Record<string, string | number | boolean>;
}

export interface SourceVariantConfig {
  dimensions: SourceVariantDimension[];
  catalog: SourceVariantCatalogItem[];
}

export interface SourceProduct {
  id: number;
  name: string;
  slug?: string;
  brand: number;
  category: number;
  slogan: string;
  description: string;
  thumbnail: string;
  variant_config: SourceVariantConfig;
  rating: number;
  reviews_count: number;
  sales_count: number;
  tags: string[];
  skin_concerns: string[];
  is_featured: boolean;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  weight?: number;
  content?: {
    ingredients?: string[];
    usage_steps?: string[];
    specifications?: Record<string, string | string[]>;
    faq?: { question: string; answer: string }[];
  };
}

export const sourceProducts = rawProducts as unknown as SourceProduct[];

/** Numeric brand id (from the dataset) → display name used across the catalog. */
export const brandIdToName: Record<number, string> = {
  294810: "L'Aura Muse",
  847291: "Maison de Soie",
  820394: "Zenith Aura",
  573920: "Éclat Vrai",
  102948: "Satin Theory",
  657483: "Element 07",
  382019: "Vora Lab",
  918273: "Silk & Dew",
  473625: "Oura Botanica",
  593821: "Bloom & Quill",
  219384: "Solar Quartz",
  847392: "Arctic Marine",
  563829: "Velvet Hour",
  729401: "Aura Tech",
  482937: "Terra-Nova",
  691283: "Clinical Core",
  384729: "Soul-Sync",
  927461: "Titan-Tech",
};

/** Numeric category id (from the dataset) → display name. */
export const categoryIdToName: Record<number, string> = {
  102938: "Cleansers & Toners",
  293847: "Serums & Treatments",
  384756: "Moisturizers",
  475869: "Eye Care",
  566970: "Sun Protection",
  657081: "Masks & Exfoliators",
  748192: "Body & Bath",
  839203: "Wellness & Aromatherapy",
};

const catalogGradients: [string, string][] = [
  [semanticColors.accent, semanticColors.info],
  [semanticColors.muted, semanticColors.primary],
  [semanticColors.successBg, semanticColors.info],
  [semanticColors.infoBg, semanticColors.primary],
  [semanticColors.accent, semanticColors.primary],
  [semanticColors.successBg, semanticColors.primary],
  [semanticColors.muted, semanticColors.info],
  [semanticColors.infoBg, semanticColors.info],
];

export { slugify as slugifyName } from "@/lib/admin/shared/slugify";

export function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export const productThumbnail = (slug: string) => `/products/images/${slug}.webp`;
export const productGallery = (slug: string) =>
  [2, 3, 4, 5, 6].map((index) => `/products/images/${slug}-${index}.webp`);

export const gradientForSlug = (slug: string): [string, string] =>
  catalogGradients[hashString(slug) % catalogGradients.length];

/** Lowest variant price acts as the "from" price shown in the catalog. */
export const lowestPrice = (variants: SourceVariantCatalogItem[]): number =>
  variants.reduce((min, variant) => Math.min(min, variant.price), Infinity) || 0;

export const totalStock = (variants: SourceVariantCatalogItem[]): number =>
  variants.reduce((sum, variant) => sum + (variant.stock_quantity ?? 0), 0);

export { resolveStockStatus as stockStatusFor } from "@/lib/admin/shared/stock-status";

/** Deterministic ISO date spread across the past year for created/updated stamps. */
export function dateForSlug(slug: string, offsetDays = 0): string {
  const dayWindow = 330;
  const day = hashString(slug) % dayWindow;
  const created = new Date(Date.UTC(2025, 6, 1) + (day + offsetDays) * 86_400_000);
  return created.toISOString().slice(0, 10);
}
