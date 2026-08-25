import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import type { Brand } from "@/lib/admin/mocks/types";
import {
  createStoredBrand,
  deleteStoredBrand,
  findStoredBrand,
  findStoredBrandDetails,
  readStoredBrands,
  updateStoredBrand,
} from "@/lib/admin/brands/store";
import {
  adminMutations,
  getAdminBrandById,
  getAdminBrands,
} from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mapBrand } from "@/lib/admin/data-source/mappers/catalog";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

/** Client rehydrate after SSR seed (mock reads local store; API keeps server list). */
export function rehydrateBrands(serverList: Brand[] = []): Brand[] {
  if (shouldUseAdminApi() || typeof window === "undefined") return serverList;
  return readStoredBrands();
}

/**
 * Canonical brand list loader for TanStack Query.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listBrands(): Promise<Brand[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredBrands();
  }
  return getAdminBrands();
}

/** Canonical brand detail loader for TanStack Query. */
export async function getBrandById(id: string): Promise<Brand | null> {
  if (!shouldUseAdminApi()) {
    return findStoredBrand(id);
  }
  return getAdminBrandById(id);
}

function toApiBrandBody(values: BrandFormValues) {
  return {
    name: values.name,
    monogram: values.monogram,
    description: values.description,
    thumbnail: values.thumbnail,
  };
}

export async function createBrand(values: BrandFormValues): Promise<Brand> {
  if (shouldUseAdminApi()) {
    return mapBrand(await adminMutations.createBrand(toApiBrandBody(values)));
  }
  return createStoredBrand(values);
}

export async function updateBrand(id: string, values: BrandFormValues): Promise<Brand | null> {
  if (shouldUseAdminApi()) {
    return mapBrand(await adminMutations.updateBrand(id, toApiBrandBody(values)));
  }
  return updateStoredBrand(id, values);
}

/** Deletes a brand. UI should optimistically remove then rollback on throw. */
export async function deleteBrand(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.deleteBrand(id);
    return;
  }
  deleteStoredBrand(id);
}

/** Form-detail map for brand edit/preview (mock store only). */
export function getBrandFormDetails(id: string): Partial<BrandFormValues> {
  return findStoredBrandDetails(id) ?? {};
}
