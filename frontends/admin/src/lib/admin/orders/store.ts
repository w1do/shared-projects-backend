/**
 * Versioned localStorage store for orders (mock backend).
 */
import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { mockDetailedOrders } from "@/lib/admin/mocks/orders";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const seed: DetailedOrder[] = [...mockDetailedOrders];
const store = createVersionedLocalStore<DetailedOrder>({
  storageKey: storageKey("orders"),
  seedVersionKey: storageKey("orders-seed-version"),
  seedVersion: "2",
  seed,
});

export function readStoredOrders(): DetailedOrder[] {
  return store.read();
}

export function saveStoredOrders(items: DetailedOrder[]) {
  store.save(items);
}

export function updateStoredOrderStatus(
  id: string,
  status: DetailedOrder["status"],
  patch: DetailedOrder,
): DetailedOrder | null {
  const items = readStoredOrders();
  if (!items.some((order) => order.id === id)) return null;
  const next = items.map((order) => (order.id === id ? { ...patch, status } : order));
  saveStoredOrders(next);
  return next.find((order) => order.id === id) ?? null;
}
