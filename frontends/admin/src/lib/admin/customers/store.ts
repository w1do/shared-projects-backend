/**
 * Versioned localStorage store for customers (mock backend).
 */
import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { mockDetailedCustomers } from "@/lib/admin/mocks/customers";
import { createVersionedLocalStore } from "@/lib/admin/shared/local-store";
import { storageKey } from "@/lib/site-config";

const seed: DetailedCustomer[] = [...mockDetailedCustomers];
const store = createVersionedLocalStore<DetailedCustomer>({
  storageKey: storageKey("customers"),
  seedVersionKey: storageKey("customers-seed-version"),
  seedVersion: "2",
  seed,
});

export function readStoredCustomers(): DetailedCustomer[] {
  return store.read();
}

export function saveStoredCustomers(items: DetailedCustomer[]) {
  store.save(items);
}
