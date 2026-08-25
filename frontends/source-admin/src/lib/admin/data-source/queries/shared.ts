import { getAdminMockDelayMs, shouldUseAdminApi } from "../config";
import type { ApiCollection, ApiOrder } from "../api-types";

/**
 * Optional artificial latency for mock data paths.
 * Used by fromSource and by services that bypass fromSource (e.g. localStorage reads).
 * No-op when NEXT_PUBLIC_ADMIN_MOCK_DELAY_MS is 0/empty or when not awaited on API paths.
 */
export async function mockNetworkDelay(): Promise<void> {
  const ms = getAdminMockDelayMs();
  if (ms <= 0) return;
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function withMockDelay<T>(value: T): Promise<T> {
  await mockNetworkDelay();
  return value;
}

/**
 * Dual-mode data loader: API when enabled, otherwise mock.
 * Accepts a value or a lazy factory so storage-backed mocks re-read on every call
 * (avoids stale snapshots from eager evaluation at call-site construction).
 * Mock branch applies env-driven latency so Query isPending can drive skeletons.
 */
export async function fromSource<T>(loader: () => Promise<T>, mockData: T | (() => T)): Promise<T> {
  if (shouldUseAdminApi()) {
    return loader();
  }

  const data = typeof mockData === "function" ? (mockData as () => T)() : mockData;
  return withMockDelay(data);
}

export function buildRevenueByProduct(orders: ApiOrder[]) {
  const revenueByProduct = new Map<string, number>();
  for (const order of orders) {
    if (order.status === "REFUNDED" || order.status === "CANCELLED") {
      continue;
    }
    for (const item of order.items ?? []) {
      revenueByProduct.set(
        item.productId,
        (revenueByProduct.get(item.productId) ?? 0) + Number(item.lineTotal ?? 0),
      );
    }
  }
  return revenueByProduct;
}

export function collectionRevenue(
  collection: ApiCollection,
  revenueByProduct: Map<string, number>,
) {
  return (collection.products ?? []).reduce(
    (sum, product) => sum + (revenueByProduct.get(product.id) ?? 0),
    0,
  );
}
