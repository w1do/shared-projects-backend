/**
 * Versioned localStorage store for product variant configs (mock backend).
 */
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { mockVariantConfigs } from "@/lib/admin/mocks/variants";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const seed: ProductVariantConfig[] = [...mockVariantConfigs];
const store = createVersionedLocalStore<ProductVariantConfig>({
  storageKey: storageKey("variants"),
  seedVersionKey: storageKey("variants-seed-version"),
  seedVersion: "5",
  seed,
});

export function readStoredVariantConfigs(): ProductVariantConfig[] {
  return store.read();
}

export function saveStoredVariantConfigs(items: ProductVariantConfig[]) {
  store.save(items);
}

export function upsertStoredVariantConfig(config: ProductVariantConfig): ProductVariantConfig {
  const items = readStoredVariantConfigs();
  const exists = items.some((item) => item.productId === config.productId);
  const next = exists
    ? items.map((item) => (item.productId === config.productId ? config : item))
    : [config, ...items];
  saveStoredVariantConfigs(next);
  return config;
}
