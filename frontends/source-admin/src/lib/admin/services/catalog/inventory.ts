import type { InventoryItem } from "@/lib/admin/mocks/types";
import type { InventoryFormValues } from "@/lib/admin/schemas/catalog/inventory-form-schema";
import {
  readStoredInventory,
  readStoredProducts,
  saveStoredInventory,
  saveStoredProducts,
} from "@/lib/admin/products/store";
import { adminMutations } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

type InventoryItemWithVariant = InventoryItem & { variantId?: string };

function resolveVariantId(item: InventoryItem): string {
  return (item as InventoryItemWithVariant).variantId ?? item.id;
}

function resolveStockStatus(stock: number, threshold: number): InventoryItem["stockStatus"] {
  if (stock === 0) return "Out of Stock";
  if (stock <= threshold) return "Low Stock";
  return "In Stock";
}

function syncProductStock(item: InventoryItem) {
  const products = [...readStoredProducts()];
  const productIdx = products.findIndex((product) => product.id === item.productId);
  if (productIdx === -1) return;
  products[productIdx] = {
    ...products[productIdx],
    stock: item.stock,
    stockStatus: item.stockStatus,
  };
  saveStoredProducts(products);
}

function persistMockInventory(nextList: InventoryItem[], targetId: string) {
  saveStoredInventory(nextList);
  const target = nextList.find((item) => item.id === targetId);
  if (target) syncProductStock(target);
}

export async function adjustInventoryItem(
  id: string,
  delta: number,
  currentList: InventoryItem[],
): Promise<InventoryItem[]> {
  const nextList = currentList.map((item) => {
    if (item.id !== id) return item;
    const stock = Math.max(0, item.stock + delta);
    return {
      ...item,
      stock,
      stockStatus: resolveStockStatus(stock, item.threshold),
      updatedAt: new Date().toISOString(),
    };
  });

  if (shouldUseAdminApi()) {
    const target = currentList.find((item) => item.id === id);
    if (target) {
      await adminMutations.adjustInventory(resolveVariantId(target), delta);
    }
    return nextList;
  }

  persistMockInventory(nextList, id);
  return nextList;
}

export async function updateInventoryItem(
  item: InventoryItem,
  values: InventoryFormValues,
  currentList: InventoryItem[],
): Promise<InventoryItem[]> {
  const nextList = currentList.map((entry) => {
    if (entry.id !== item.id) return entry;
    return {
      ...entry,
      stock: values.stock,
      incoming: values.incoming,
      threshold: values.threshold,
      location: values.location,
      stockStatus: resolveStockStatus(values.stock, values.threshold),
      updatedAt: new Date().toISOString(),
    };
  });

  if (shouldUseAdminApi()) {
    await adminMutations.updateInventory(resolveVariantId(item), {
      onHand: values.stock,
      incoming: values.incoming,
      threshold: values.threshold,
      location: values.location,
    });
    return nextList;
  }

  persistMockInventory(nextList, item.id);
  return nextList;
}

/** Re-export for consumers that only need the mock read path. */
export { readStoredInventory };

/** Client rehydrate after SSR seed. */
export function rehydrateInventory(serverList: InventoryItem[] = []): InventoryItem[] {
  if (shouldUseAdminApi() || typeof window === "undefined") return serverList;
  return readStoredInventory();
}

/**
 * Canonical inventory list loader for TanStack Query.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listInventory(): Promise<InventoryItem[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredInventory();
  }
  const { getAdminInventory } = await import("@/lib/admin/data-source/admin-data");
  return getAdminInventory();
}
