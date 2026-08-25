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
import type {
  ApiBrand,
  ApiCategory,
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
import { fromSource } from "./shared";

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

export async function getAdminProducts() {
  // Lazy mock factory re-reads localStorage on every call (not a stale snapshot).
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiProduct>>(`/api/v1/products?${listQuery}`);
    return page.items.map(mapProduct);
  }, readStoredProducts);
}

export async function getAdminProductById(id: string) {
  return fromSource(
    async () => mapProduct(await adminApiGet<ApiProduct>(`/api/v1/products/${id}`)),
    () => readStoredProducts().find((product) => product.id === id) ?? null,
  );
}

export async function getAdminVariantConfigs() {
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiProduct>>(`/api/v1/products?${listQuery}`);
    return page.items
      .filter((product) => (product.variants?.length ?? 0) > 0)
      .map(mapVariantConfig);
  }, readStoredVariantConfigs);
}

export async function getAdminBrands() {
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiBrand>>(`/api/v1/brands?${listQuery}`);
    return page.items.map(mapBrand);
  }, readStoredBrands);
}

export async function getAdminBrandById(id: string) {
  return fromSource(
    async () => mapBrand(await adminApiGet<ApiBrand>(`/api/v1/brands/${id}`)),
    findStoredBrand(id) ??
      mockBrands.find((brand) => brand.id.toLowerCase() === id.toLowerCase()) ??
      null,
  );
}

export async function getAdminCategories() {
  return fromSource(async () => {
    const categories = await adminApiGet<ApiCategory[]>("/api/v1/categories?view=tree");
    return flattenCategories(categories).map(mapCategory);
  }, readStoredCategories);
}

export async function getAdminCategoryById(id: string) {
  return fromSource(
    async () => mapCategory(await adminApiGet<ApiCategory>(`/api/v1/categories/${id}`)),
    findStoredCategory(id) ??
      mockCategories.find((category) => category.id.toLowerCase() === id.toLowerCase()) ??
      null,
  );
}

export async function getAdminCollections() {
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiCollection>>(`/api/v1/collections?${listQuery}`);

    // Prefer list payload fields. Only hydrate collection detail when product
    // membership is required for UI but missing from the list response.
    const needsDetailProducts = page.items.some(
      (collection) => (collection.productCount ?? 0) > 0 && !collection.products,
    );

    // Backend list/detail currently has no bulk revenue endpoint for collections.
    // Avoid N+1 order-detail fan-out in list mode; mapCollection falls back to
    // money(collection.revenue) (0 when undefined). Recompute only on detail views
    // if a dedicated analytics endpoint is added later.
    if (!needsDetailProducts) {
      return page.items.map((collection) => mapCollection(collection));
    }

    const collectionDetails = await mapWithConcurrency(
      page.items,
      COLLECTION_DETAIL_CONCURRENCY,
      async (collection) => {
        if ((collection.productCount ?? 0) === 0 || collection.products) {
          return collection;
        }
        return adminApiGet<ApiCollection>(`/api/v1/collections/${collection.id}`);
      },
    );

    return collectionDetails.map((collection) => mapCollection(collection));
  }, readStoredCollections);
}

export async function getAdminCollectionById(id: string) {
  return fromSource(
    async () => mapCollection(await adminApiGet<ApiCollection>(`/api/v1/collections/${id}`)),
    findStoredCollection(id) ??
      mockCollections.find((collection) => collection.id.toLowerCase() === id.toLowerCase()) ??
      null,
  );
}

export async function getAdminInventory() {
  // Lazy mock factory re-reads localStorage on every call (not a stale snapshot).
  return fromSource(async () => {
    const [inventoryPage, productPage] = await Promise.all([
      adminApiGet<ApiPage<ApiInventoryItem>>(`/api/v1/inventory?${listQuery}`),
      adminApiGet<ApiPage<ApiProduct>>(`/api/v1/products?${listQuery}`),
    ]);
    const productLookup = buildInventoryProductLookup(productPage.items);
    return inventoryPage.items.map((item) => mapInventoryItem(item, productLookup));
  }, readStoredInventory);
}
