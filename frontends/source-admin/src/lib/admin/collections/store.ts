import type { CollectionFormValues } from "@/lib/admin/schemas/catalog/collection-form-schema";
import type { Collection } from "@/lib/admin/mocks/types";
import { initialCollections } from "@/lib/admin/mocks/taxonomy/collections-data";
import {
  createCollectionFromForm,
  mergeCollectionWithFormValues,
} from "@/lib/admin/collections/form";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const collectionListStorageKey = storageKey("collections");
const collectionSeedVersionKey = storageKey("collections-seed-version");
const currentCollectionSeedVersion = "5";

const collectionStore = createVersionedLocalStore<Collection>({
  storageKey: collectionListStorageKey,
  seedVersionKey: collectionSeedVersionKey,
  seedVersion: currentCollectionSeedVersion,
  seed: initialCollections,
});

function keepSingleFeatured(collections: Collection[], featuredId: string): Collection[] {
  return collections.map((collection) =>
    collection.id === featuredId || !collection.featured
      ? collection
      : { ...collection, featured: false },
  );
}

export function readStoredCollections(): Collection[] {
  return collectionStore.read();
}

export function saveStoredCollections(collections: Collection[]) {
  collectionStore.save(collections);
}

export function createStoredCollection(values: CollectionFormValues): Collection {
  const collections = readStoredCollections();
  const collection = createCollectionFromForm(
    values,
    collections.map((item) => item.id),
  );

  const nextCollections = [collection, ...collections];
  saveStoredCollections(
    collection.featured ? keepSingleFeatured(nextCollections, collection.id) : nextCollections,
  );

  return collection;
}

export function deleteStoredCollection(id: string): Collection[] {
  const nextCollections = readStoredCollections().filter((collection) => collection.id !== id);
  saveStoredCollections(nextCollections);

  return nextCollections;
}

export function toggleStoredCollectionFeatured(id: string): Collection[] {
  const collections = readStoredCollections();
  const target = collections.find((collection) => collection.id === id);

  if (!target) {
    return collections;
  }

  const nextFeatured = !target.featured;
  const toggled = collections.map((collection) =>
    collection.id === id ? { ...collection, featured: nextFeatured } : collection,
  );
  const nextCollections = nextFeatured ? keepSingleFeatured(toggled, id) : toggled;
  saveStoredCollections(nextCollections);

  return nextCollections;
}

export function findStoredCollection(id: string): Collection | null {
  return (
    readStoredCollections().find(
      (collection) => collection.id.toLowerCase() === id.toLowerCase(),
    ) ?? null
  );
}

export function updateStoredCollection(
  id: string,
  values: CollectionFormValues,
): Collection | null {
  const collections = readStoredCollections();
  const target = collections.find((collection) => collection.id.toLowerCase() === id.toLowerCase());

  if (!target) {
    return null;
  }

  const nextCollection = mergeCollectionWithFormValues(target, values);
  const merged = collections.map((collection) =>
    collection.id === target.id ? nextCollection : collection,
  );
  saveStoredCollections(
    nextCollection.featured ? keepSingleFeatured(merged, nextCollection.id) : merged,
  );

  return nextCollection;
}
