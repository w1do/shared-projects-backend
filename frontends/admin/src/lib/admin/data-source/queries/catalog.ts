import { brands as mockBrands } from "@/lib/admin/mocks/brands";
import { readStoredProducts } from "@/lib/admin/mocks/catalog";
import { mockCategories } from "@/lib/admin/mocks/taxonomy/categories";
import { mockCollections } from "@/lib/admin/mocks/taxonomy/collections";
import { readStoredInventory } from "@/lib/admin/mocks/inventory";
import { mockVariantConfigs } from "@/lib/admin/mocks/variants";
import { readStoredVariantConfigs } from "@/lib/admin/variants/store";
import { findStoredBrand, readStoredBrands } from "@/lib/admin/brands/store";
import { findStoredCategory, readStoredCategories } from "@/lib/admin/categories/store";
import { findStoredCollection, readStoredCollections } from "@/lib/admin/collections/store";
import { adminApiGet, type ApiPage } from "../api-client";
import * as platformContent from "../platform/content";
import { categoryToApiCategory } from "../platform/mappers";
import type {
  ApiBrand,
  ApiCollection,
  ApiInventoryItem,
  ApiProduct,
} from "../api-types";
import {
  buildInventoryProductLookup,
  flattenCategories,
  mapBrand,
  mapCategory,
  mapCollection,
  mapInventoryItem,
  mapProduct,
  mapVariantConfig,
} from "../mappers";
import { fromSource, mockOnly } from "./shared";

/**
 * Default page size for admin list endpoints.
 * Lists larger than this are truncated until the UI gains real pagination.
 */
const DEFAULT_PAGE_SIZE = 200;

const listQuery = `page=0&size=${DEFAULT_PAGE_SIZE}`;

/**
 * Caps concurrent detail fetches so collection list enrichment does not fan out
 * unbounded when many collections lack embedded product arrays.
 */
const COLLECTION_DETAIL_CONCURRENCY = 6;

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await mapper(items[current]);
    }
  }

  const workerCount = Math.min(concurrency, items.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

// Каталога товаров и брендов в платформе нет — эти разделы всегда на демо-данных.
export async function getAdminProducts() {
  return mockOnly(readStoredProducts);
}

export async function getAdminProductById(id: string) {
  return mockOnly(() => readStoredProducts().find((product) => product.id === id) ?? null);
}

export async function getAdminVariantConfigs() {
  return mockOnly(readStoredVariantConfigs);
}

export async function getAdminBrands() {
  return mockOnly(readStoredBrands);
}

export async function getAdminBrandById(id: string) {
  return mockOnly(
    findStoredBrand(id) ??
      mockBrands.find((brand) => brand.id.toLowerCase() === id.toLowerCase()) ??
      null,
  );
}

/** categories → content-service: дерево категорий проекта (nested set). */
export async function getAdminCategories() {
  return fromSource(async () => {
    const tree = await platformContent.listCategories();
    const categories = tree.map((node, index) => categoryToApiCategory(node, index));
    return flattenCategories(categories).map(mapCategory);
  }, readStoredCategories);
}

export async function getAdminCategoryById(id: string) {
  return fromSource(
    async () => {
      const tree = await platformContent.listCategories();
      const flat = flattenCategories(tree.map((node, index) => categoryToApiCategory(node, index)));
      const found = flat.find((category) => category.id === id);
      return found ? mapCategory(found) : null;
    },
    findStoredCategory(id) ??
      mockCategories.find((category) => category.id.toLowerCase() === id.toLowerCase()) ??
      null,
  );
}

// Коллекций в платформе нет — раздел всегда на демо-данных.
export async function getAdminCollections() {
  return mockOnly(readStoredCollections);
}

export async function getAdminCollectionById(id: string) {
  return mockOnly(
    findStoredCollection(id) ??
      mockCollections.find((collection) => collection.id.toLowerCase() === id.toLowerCase()) ??
      null,
  );
}

// Складских остатков в платформе нет — раздел всегда на демо-данных.
export async function getAdminInventory() {
  return mockOnly(readStoredInventory);
}
