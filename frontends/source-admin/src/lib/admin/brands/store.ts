import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import type { Brand } from "@/lib/admin/mocks/types";
import { initialBrands, initialBrandDetailsBySlug } from "./initial";
import { createBrandFromForm, mergeBrandWithFormValues } from "@/lib/admin/brands/form";
import { createVersionedLocalStore, readJson, writeJson } from "@/lib/admin/shared/local-store";

import { storageKey } from "@/lib/site-config";

const brandListStorageKey = storageKey("brands");
const brandDetailsStorageKey = storageKey("brand-details");
const brandSeedVersionKey = storageKey("brands-seed-version");
const currentBrandSeedVersion = "4";

type BrandDetailsMap = Record<string, Partial<BrandFormValues>>;

const brandStore = createVersionedLocalStore<Brand>({
  storageKey: brandListStorageKey,
  seedVersionKey: brandSeedVersionKey,
  seedVersion: currentBrandSeedVersion,
  seed: initialBrands,
});

export function readStoredBrands(): Brand[] {
  return brandStore.read();
}

export function saveStoredBrands(brandsList: Brand[]) {
  brandStore.save(brandsList);
}

export function deleteStoredBrand(id: string) {
  const nextBrands = readStoredBrands().filter((brand) => brand.id !== id);
  const nextDetails = readStoredBrandDetails();

  delete nextDetails[id];
  saveStoredBrands(nextBrands);
  writeStoredBrandDetails(nextDetails);

  return nextBrands;
}

export function createStoredBrand(values: BrandFormValues) {
  const brands = readStoredBrands();
  const brand = createBrandFromForm(
    values,
    brands.map((item) => item.id),
  );

  saveStoredBrands([brand, ...brands]);
  writeStoredBrandDetails({
    ...readStoredBrandDetails(),
    [brand.id]: values,
  });

  return brand;
}

export function updateStoredBrand(id: string, values: BrandFormValues) {
  const brands = readStoredBrands();
  const targetBrand = brands.find((brand) => brand.id.toLowerCase() === id.toLowerCase());

  if (!targetBrand) {
    return null;
  }

  const nextBrand = mergeBrandWithFormValues(targetBrand, values);
  saveStoredBrands(brands.map((brand) => (brand.id === targetBrand.id ? nextBrand : brand)));
  writeStoredBrandDetails({
    ...readStoredBrandDetails(),
    [targetBrand.id]: values,
  });

  return nextBrand;
}

export function findStoredBrand(id: string) {
  return readStoredBrands().find((brand) => brand.id.toLowerCase() === id.toLowerCase()) ?? null;
}

function hasBrandMedia(details?: Partial<BrandFormValues> | null): boolean {
  if (!details) return false;
  return Boolean(details.thumbnail || (details.logo && details.logo.length > 0));
}

/**
 * Resolve brand form details by id/slug (case-insensitive).
 * Merges seed media when an older localStorage blob is missing logo/thumbnail.
 */
export function findStoredBrandDetails(id: string): Partial<BrandFormValues> | null {
  const normalized = id.toLowerCase();
  const brand = findStoredBrand(id);
  const detailsMap = readStoredBrandDetails();

  const stored =
    (brand ? detailsMap[brand.id] : undefined) ??
    detailsMap[id] ??
    detailsMap[normalized] ??
    Object.entries(detailsMap).find(([key]) => key.toLowerCase() === normalized)?.[1];

  const seed =
    initialBrandDetailsBySlug[normalized] ??
    (brand ? initialBrandDetailsBySlug[brand.id] : undefined) ??
    initialBrandDetailsBySlug[id];

  if (!stored && !seed) {
    return null;
  }

  // Prefer stored form fields, but never drop seed media if storage is incomplete.
  const merged: Partial<BrandFormValues> = {
    ...seed,
    ...stored,
    logo: stored?.logo?.length ? stored.logo : seed?.logo,
    banner: stored?.banner?.length ? stored.banner : seed?.banner,
    thumbnail: stored?.thumbnail || seed?.thumbnail,
  };

  if (!hasBrandMedia(merged) && seed) {
    return { ...merged, ...seed };
  }

  return merged;
}

export function readStoredBrandDetails(): BrandDetailsMap {
  const stored = readJson<BrandDetailsMap>(brandDetailsStorageKey);
  if (!stored) {
    writeStoredBrandDetails(initialBrandDetailsBySlug);
    return { ...initialBrandDetailsBySlug };
  }

  // Heal incomplete legacy blobs (missing media paths) without wiping user edits.
  let healed = false;
  const next: BrandDetailsMap = { ...stored };
  for (const [slug, seedDetails] of Object.entries(initialBrandDetailsBySlug)) {
    const current = next[slug];
    if (!hasBrandMedia(current)) {
      next[slug] = {
        ...seedDetails,
        ...current,
        logo: current?.logo?.length ? current.logo : seedDetails.logo,
        banner: current?.banner?.length ? current.banner : seedDetails.banner,
        thumbnail: current?.thumbnail || seedDetails.thumbnail,
      };
      healed = true;
    }
  }

  if (healed) {
    writeStoredBrandDetails(next);
  }

  return next;
}

export function writeStoredBrandDetails(details: BrandDetailsMap) {
  writeJson(brandDetailsStorageKey, details);
}
