import type { DetailedOrder } from "@/lib/admin/mocks/orders";
import { readStoredOrders, updateStoredOrderStatus } from "@/lib/admin/orders/store";
import { adminMutations, getAdminOrders } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

/**
 * Canonical orders list for TanStack Query.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listOrders(): Promise<DetailedOrder[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredOrders();
  }
  return getAdminOrders();
}

/**
 * Persist status change. `patchedOrder` is the UI-derived timeline snapshot for mock mode.
 */
export async function updateOrderStatus(
  id: string,
  status: DetailedOrder["status"] | string,
  patchedOrder?: DetailedOrder,
): Promise<DetailedOrder | null> {
  if (shouldUseAdminApi()) {
    await adminMutations.updateOrderStatus(id, status);
    return patchedOrder ?? null;
  }
  if (!patchedOrder) return null;
  return updateStoredOrderStatus(id, status as DetailedOrder["status"], patchedOrder);
}
