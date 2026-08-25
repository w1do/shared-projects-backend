import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { readStoredCustomers } from "@/lib/admin/customers/store";
import { getAdminCustomers } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";

/**
 * Canonical customers list for TanStack Query.
 * Mock latency comes from mockNetworkDelay so list pages can share skeleton UX.
 */
export async function listCustomers(): Promise<DetailedCustomer[]> {
  if (!shouldUseAdminApi()) {
    await mockNetworkDelay();
    return readStoredCustomers();
  }
  return getAdminCustomers();
}
