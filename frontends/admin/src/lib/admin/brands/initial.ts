import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import type { Brand } from "@/lib/admin/mocks/types";
import { brandContents, type BrandContent } from "@/lib/admin/mocks/brands/data";

function hashSlug(slug: string): number {
  let hash = 0;
  for (let index = 0; index < slug.length; index += 1) {
    hash = (hash * 31 + slug.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildMonogram(name: string): string {
  const words = name
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const raw = words.length >= 2 ? `${words[0][0]}${words[1][0]}` : (words[0] ?? name).slice(0, 2);
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

function synthRevenue(content: BrandContent): number {
  const base = 28000 + content.productsCount * 12000;
  return base + (hashSlug(content.slug) % 40) * 1000;
}

function synthDelta(slug: string): number {
  const value = ((hashSlug(slug) >> 3) % 360) / 10 - 12;
  return Math.round(value * 10) / 10;
}

function synthTrend(slug: string, delta: number): number[] {
  const direction = delta >= 0 ? 1 : -1;
  const seed = hashSlug(slug);
  const start = 14 + (seed % 8);
  return Array.from({ length: 12 }, (_, index) => {
    const jitter = ((seed >> index) % 5) - 2;
    return Math.max(4, start + direction * index * 2 + jitter);
  });
}

export const brandLogoPath = (slug: string) => `/brands/logos/${slug}.webp`;
export const brandThumbnailPath = (slug: string) => `/brands/thumbnails/${slug}.webp`;

const revenueBySlug = new Map(
  brandContents.map((content) => [content.slug, synthRevenue(content)]),
);
const totalRevenue = [...revenueBySlug.values()].reduce((sum, value) => sum + value, 0);

export const initialBrands: Brand[] = brandContents.map((content) => {
  const revenue = revenueBySlug.get(content.slug) ?? 0;
  const delta = synthDelta(content.slug);

  return {
    id: content.slug,
    name: content.name,
    monogram: buildMonogram(content.name),
    revenue,
    share: Math.round((revenue / totalRevenue) * 1000) / 10,
    delta,
    trend: synthTrend(content.slug, delta),
  };
});

export const initialBrandDetailsBySlug: Record<
  string,
  Partial<BrandFormValues>
> = Object.fromEntries(
  brandContents.map((content) => [
    content.slug,
    {
      description: content.description,
      status: "Active",
      logo: [brandLogoPath(content.slug)],
      banner: [brandThumbnailPath(content.slug)],
      thumbnail: brandThumbnailPath(content.slug),
      isFeatured: content.productsCount >= 5,
      metaTitle: `${content.name} | ${content.slogan}`,
      metaDescription: content.description.slice(0, 160),
    } satisfies Partial<BrandFormValues>,
  ]),
);
