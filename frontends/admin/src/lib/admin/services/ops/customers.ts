import type { DetailedCustomer } from "@/lib/admin/mocks/customers";
import { readStoredCustomers } from "@/lib/admin/customers/store";
import { getAdminCustomers } from "@/lib/admin/data-source/admin-data";
import { shouldUseAdminApi } from "@/lib/admin/data-source/config";
import { mockNetworkDelay } from "@/lib/admin/data-source/queries/shared";
import * as platformAuth from "@/lib/admin/data-source/platform/auth";

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

/**
 * Блокировка/разблокировка пользователя проекта (auth-service).
 * В mock-режиме операция недоступна: демо-данные состояния блокировки не ведут.
 */
export async function setCustomerBlocked(id: string, blocked: boolean): Promise<void> {
  if (!shouldUseAdminApi()) return;
  await (blocked ? platformAuth.blockProjectUser(id) : platformAuth.unblockProjectUser(id));
}

/**
 * Удаление пользователя проекта (auth-service). Необратимо.
 * В mock-режиме недоступно: демо-данные вёрстки только читаются.
 */
export async function deleteCustomer(id: string): Promise<void> {
  if (!shouldUseAdminApi()) return;
  await platformAuth.deleteProjectUser(id);
}
