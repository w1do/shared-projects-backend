import type { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import type { ProductFull } from "@/lib/admin/mocks/types";
import {
  archiveStoredProduct,
  archiveStoredProducts,
  createStoredProduct,
  deleteStoredProduct,
  deleteStoredProducts,
  readStoredProducts,
  updateStoredProduct,
} from "@/lib/admin/products/store";
import {
  adminMutations,
  getAdminProductById,
  getAdminProducts,
} from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mapProduct } from "@/lib/admin/data-source/mappers/catalog-products";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

/** Client rehydrate after SSR seed. */
export function rehydrateProducts(serverList: ProductFull[] = []): ProductFull[] {
  if (shouldUseAdminApi() || typeof window === "undefined") return serverList;
  return readStoredProducts();
}

/** Enrichment helper — returns catalog products for cards/previews (empty when unavailable). */
export function getProductsForEnrichment(fallback: ProductFull[] = []): ProductFull[] {
  if (typeof window === "undefined") return fallback;
  if (shouldUseAdminApi()) return fallback;
  return readStoredProducts();
}

/**
 * Canonical product list loader used by TanStack Query and SSR routes.
 * Mock mode reads localStorage-backed catalog on every call; API mode hits admin API.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listProducts(): Promise<ProductFull[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredProducts();
  }
  return getAdminProducts();
}

/** Canonical product detail loader for TanStack Query / SSR. */
export async function getProductById(id: string): Promise<ProductFull | null> {
  if (!shouldUseAdminApi()) {
    return (
      readStoredProducts().find((product) => product.id.toLowerCase() === id.toLowerCase()) ?? null
    );
  }
  return getAdminProductById(id);
}

function toApiCreateBody(values: ProductFormValues) {
  return {
    name: values.name,
    brandId: values.brand,
    categoryId: values.category,
    price: values.price,
    status: values.status,
    imageUrl: values.thumbnail || values.images?.[0],
    sku: values.sku,
    stockQuantity: values.stock ?? 0,
  };
}

function toApiUpdateBody(values: ProductFormValues) {
  return {
    name: values.name,
    brandId: values.brand,
    categoryId: values.category,
    price: values.price,
    status: values.status,
    imageUrl: values.thumbnail || values.images?.[0],
  };
}

export async function createProduct(values: ProductFormValues): Promise<ProductFull> {
  if (shouldUseAdminApi()) {
    return mapProduct(await adminMutations.createProduct(toApiCreateBody(values)));
  }
  return createStoredProduct(values);
}

export async function updateProduct(
  id: string,
  values: ProductFormValues,
): Promise<ProductFull | null> {
  if (shouldUseAdminApi()) {
    return mapProduct(await adminMutations.updateProduct(id, toApiUpdateBody(values)));
  }
  return updateStoredProduct(id, values);
}

/** Deletes a product. UI should optimistically remove then rollback on throw. */
export async function deleteProduct(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.deleteProduct(id);
    return;
  }
  deleteStoredProduct(id);
}

export async function deleteProducts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  if (shouldUseAdminApi()) {
    await Promise.all(ids.map((id) => adminMutations.deleteProduct(id)));
    return;
  }

  deleteStoredProducts(ids);
}

export async function archiveProduct(id: string): Promise<ProductFull | null> {
  if (shouldUseAdminApi()) {
    const product = await getAdminProductById(id);
    if (!product) return null;
    return mapProduct(
      await adminMutations.updateProduct(id, {
        name: product.name,
        brandId: product.brand,
        categoryId: product.category,
        price: product.price,
        status: "Archived",
        imageUrl: product.image,
      }),
    );
  }

  return archiveStoredProduct(id);
}

export async function archiveProducts(ids: string[]): Promise<ProductFull[]> {
  if (ids.length === 0) return listProducts();

  if (shouldUseAdminApi()) {
    await Promise.all(ids.map((id) => archiveProduct(id)));
    return listProducts();
  }

  return archiveStoredProducts(ids);
}
