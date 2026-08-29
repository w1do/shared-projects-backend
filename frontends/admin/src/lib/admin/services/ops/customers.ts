import type { DetailedCustomer } from "@/lib/admin/types/customers";
import { getAdminCustomers } from "@/lib/admin/data-source/admin-data";
import * as platformAuth from "@/lib/admin/data-source/platform/auth";

/** Список пользователей проекта для TanStack Query. */
export async function listCustomers(): Promise<DetailedCustomer[]> {
  return getAdminCustomers();
}

/** Блокировка и разблокировка пользователя проекта (auth-service). */
export async function setCustomerBlocked(id: string, blocked: boolean): Promise<void> {
  await (blocked ? platformAuth.blockProjectUser(id) : platformAuth.unblockProjectUser(id));
}

/** Удаление пользователя проекта (auth-service). Необратимо. */
export async function deleteCustomer(id: string): Promise<void> {
  await platformAuth.deleteProjectUser(id);
}
