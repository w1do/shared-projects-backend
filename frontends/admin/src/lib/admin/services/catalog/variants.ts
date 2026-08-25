import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import {
  readStoredVariantConfigs,
  saveStoredVariantConfigs,
  upsertStoredVariantConfig,
} from "@/lib/admin/variants/store";
import { getAdminVariantConfigs } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

/**
 * Canonical variant configs list for TanStack Query.
 * Mock latency comes from mockNetworkDelay so the page can share skeleton UX.
 */
export async function listVariantConfigs(): Promise<ProductVariantConfig[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredVariantConfigs();
  }
  return getAdminVariantConfigs();
}

/** Persist full matrix configs (mock). API mode is read-only in this template. */
export async function saveVariantConfigs(
  configs: ProductVariantConfig[],
): Promise<ProductVariantConfig[]> {
  if (shouldUseAdminApi()) {
    throw new Error("Variant matrix writes are not available over the API in this template.");
  }
  saveStoredVariantConfigs(configs);
  return configs;
}

export async function upsertVariantConfig(
  config: ProductVariantConfig,
): Promise<ProductVariantConfig> {
  if (shouldUseAdminApi()) {
    throw new Error("Variant matrix writes are not available over the API in this template.");
  }
  return upsertStoredVariantConfig(config);
}
