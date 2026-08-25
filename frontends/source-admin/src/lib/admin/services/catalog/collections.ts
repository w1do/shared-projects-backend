import type { CollectionFormValues } from "@/lib/admin/schemas/catalog/collection-form-schema";
import type { Collection } from "@/lib/admin/mocks/types";
import {
  createStoredCollection,
  deleteStoredCollection,
  findStoredCollection,
  readStoredCollections,
  toggleStoredCollectionFeatured,
  updateStoredCollection,
} from "@/lib/admin/collections/store";
import {
  adminMutations,
  getAdminCollectionById,
  getAdminCollections,
} from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mapCollection } from "@/lib/admin/data-source/mappers/catalog";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

/** Client rehydrate after SSR seed (mock reads local store; API keeps server list). */
export function rehydrateCollections(serverList: Collection[] = []): Collection[] {
  if (shouldUseAdminApi() || typeof window === "undefined") return serverList;
  return readStoredCollections();
}

/**
 * Canonical collection list loader for TanStack Query.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listCollections(): Promise<Collection[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredCollections();
  }
  return getAdminCollections();
}

/** Canonical collection detail loader for TanStack Query. */
export async function getCollectionById(id: string): Promise<Collection | null> {
  if (!shouldUseAdminApi()) {
    return findStoredCollection(id);
  }
  return getAdminCollectionById(id);
}

function toApiCollectionBody(values: CollectionFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description,
    status: values.status,
    featured: values.featured,
    products: values.products,
  };
}

function applyFeaturedToggle(collections: Collection[], id: string): Collection[] {
  return collections.map((collection) => {
    const isTarget = collection.id === id;
    const nextFeatured = isTarget ? !collection.featured : false;
    return isTarget || collection.featured ? { ...collection, featured: nextFeatured } : collection;
  });
}

export async function createCollection(values: CollectionFormValues): Promise<Collection> {
  if (shouldUseAdminApi()) {
    return mapCollection(await adminMutations.createCollection(toApiCollectionBody(values)));
  }
  return createStoredCollection(values);
}

export async function updateCollection(
  id: string,
  values: CollectionFormValues,
): Promise<Collection | null> {
  if (shouldUseAdminApi()) {
    return mapCollection(await adminMutations.updateCollection(id, toApiCollectionBody(values)));
  }
  return updateStoredCollection(id, values);
}

/** Deletes a collection. UI should optimistically remove then rollback on throw. */
export async function deleteCollection(id: string): Promise<void> {
  if (shouldUseAdminApi()) {
    await adminMutations.deleteCollection(id);
    return;
  }
  deleteStoredCollection(id);
}

/**
 * Toggles featured state. API mode optimistically derives the next list and
 * patches the server; mock mode persists via local store helpers.
 */
export async function toggleCollectionFeatured(
  id: string,
  currentList: Collection[],
): Promise<Collection[]> {
  if (shouldUseAdminApi()) {
    const next = applyFeaturedToggle(currentList, id);
    const target = next.find((collection) => collection.id === id);
    if (target) {
      await adminMutations.toggleCollectionFeatured(id, target.featured);
    }
    return next;
  }
  return toggleStoredCollectionFeatured(id);
}
