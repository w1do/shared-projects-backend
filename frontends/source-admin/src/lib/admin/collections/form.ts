import type { CollectionFormValues } from "@/lib/admin/schemas/catalog/collection-form-schema";
import type { Collection } from "@/lib/admin/mocks/types";
import { slugify } from "@/lib/admin/shared/slugify";

export const defaultCollectionFormValues: CollectionFormValues = {
  name: "",
  slug: "",
  description: "",
  status: "Active",
  banner: "",
  thumbnail: "",
  featured: false,
  products: [],
  revenue: 0,
  views: 0,
  growthYoY: 0,
};

export const sampleCollectionFormValues: CollectionFormValues = {
  name: "Midnight Recovery Edit",
  slug: "midnight-recovery-edit",
  description:
    "A curated nighttime ritual of repairing ampoules, ceramide creams, and sleeping masks engineered for barrier renewal while you rest.",
  status: "Active",
  banner: "/magazine/images/banners/273360.webp",
  thumbnail: "/magazine/images/thumbnails/273360.webp",
  featured: true,
  products: ["radiant-aura-serum", "golden-glow-essence", "prism-light-serum"],
  revenue: 86400,
  views: 5230,
  growthYoY: 17.4,
};

export function slugifyCollectionName(name: string) {
  return slugify(name);
}

export function createCollectionId(name: string, existingIds: string[] = []) {
  const baseId = `col-${slugifyCollectionName(name) || "collection"}`;

  if (!existingIds.includes(baseId)) {
    return baseId;
  }

  let suffix = 2;
  let nextId = `${baseId}-${suffix}`;

  while (existingIds.includes(nextId)) {
    suffix += 1;
    nextId = `${baseId}-${suffix}`;
  }

  return nextId;
}

export function createCollectionFromForm(
  values: CollectionFormValues,
  existingIds: string[] = [],
): Collection {
  const name = values.name.trim();
  const today = new Date().toISOString().slice(0, 10);

  return {
    id: createCollectionId(name, existingIds),
    name,
    slug: values.slug.trim() || slugifyCollectionName(name),
    description: values.description?.trim() || undefined,
    status: values.status,
    banner: values.banner,
    thumbnail: values.thumbnail,
    featured: values.featured,
    products: values.products,
    productCount: values.products.length,
    revenue: values.revenue,
    views: values.views,
    growthYoY: values.growthYoY,
    createdAt: today,
    updatedAt: today,
  };
}

export function createCollectionFormValues(collection: Collection): CollectionFormValues {
  return {
    name: collection.name,
    slug: collection.slug,
    description: collection.description ?? "",
    status: collection.status,
    banner: collection.banner,
    thumbnail: collection.thumbnail,
    featured: collection.featured,
    products: collection.products,
    revenue: collection.revenue,
    views: collection.views,
    growthYoY: collection.growthYoY,
  };
}

export function mergeCollectionWithFormValues(
  collection: Collection,
  values: CollectionFormValues,
): Collection {
  const name = values.name.trim();

  return {
    ...collection,
    name,
    slug: values.slug.trim() || slugifyCollectionName(name),
    description: values.description?.trim() || undefined,
    status: values.status,
    banner: values.banner,
    thumbnail: values.thumbnail,
    featured: values.featured,
    products: values.products,
    productCount: values.products.length,
    revenue: values.revenue,
    views: values.views,
    growthYoY: values.growthYoY,
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}
