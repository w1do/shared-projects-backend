import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import type { Category } from "@/lib/admin/mocks/types";
import {
  createStoredCategory,
  deleteStoredCategory,
  findStoredCategory,
  readStoredCategories,
  updateStoredCategory,
} from "@/lib/admin/categories/store";
import {
  adminMutations,
  getAdminCategories,
  getAdminCategoryById,
} from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mapCategory } from "@/lib/admin/data-source/mappers/catalog";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

/** Client rehydrate after SSR seed (mock reads local store; API keeps server list). */
export function rehydrateCategories(serverList: Category[] = []): Category[] {
  if (shouldUseAdminApi() || typeof window === "undefined") return serverList;
  return readStoredCategories();
}

/**
 * Canonical category list loader for TanStack Query.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listCategories(): Promise<Category[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredCategories();
  }
  return getAdminCategories();
}

/** Canonical category detail loader for TanStack Query. */
export async function getCategoryById(id: string): Promise<Category | null> {
  if (!shouldUseAdminApi()) {
    // Case-insensitive match — route params and stored ids can differ in casing.
    return findStoredCategory(id);
  }
  return getAdminCategoryById(id);
}

function toApiCategoryBody(values: CategoryFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    displayOrder: values.displayOrder,
    status: values.status,
  };
}

export async function createCategory(values: CategoryFormValues): Promise<Category> {
  if (shouldUseAdminApi()) {
    return mapCategory(await adminMutations.createCategory(toApiCategoryBody(values)));
  }
  return createStoredCategory(values);
}

export async function updateCategory(
  id: string,
  values: CategoryFormValues,
): Promise<Category | null> {
  if (shouldUseAdminApi()) {
    return mapCategory(await adminMutations.updateCategory(id, toApiCategoryBody(values)));
  }
  return updateStoredCategory(id, values);
}

/** Deletes a category. UI should optimistically remove then rollback on throw. */
export async function deleteCategory(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.deleteCategory(id);
    return;
  }
  deleteStoredCategory(id);
}
