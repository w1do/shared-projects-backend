import { mapCustomer } from "../mappers";
import * as platformAuth from "../platform/auth";
import { projectUserToCustomer } from "../platform/mappers";
import { fromSource, mockOnly } from "./shared";
import { readStoredOrders } from "@/lib/admin/orders/store";
import { readStoredCustomers } from "@/lib/admin/customers/store";
import { readStoredPromotions } from "@/lib/admin/promotions/store";

/** Заказов в платформе нет — раздел работает на демо-данных вёрстки. */
export async function getAdminOrders() {
  return mockOnly(readStoredOrders);
}

/** customers → auth-service: пользователи текущего проекта. */
export async function getAdminCustomers() {
  return fromSource(async () => {
    const users = await platformAuth.listProjectUsers();
    return users.map((user) => mapCustomer(projectUserToCustomer(user)));
  }, readStoredCustomers);
}

/** Промо-модуля в платформе нет — раздел работает на демо-данных вёрстки. */
export async function getAdminPromotions() {
  return mockOnly(readStoredPromotions);
}
