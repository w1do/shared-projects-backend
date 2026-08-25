import { adminApiGet, type ApiPage } from "../api-client";
import type { ApiCustomer, ApiOrderSummary, ApiPromotion } from "../api-types";
import { mapCustomer, mapOrder, mapPromotion } from "../mappers";
import { fromSource } from "./shared";
import { readStoredOrders } from "@/lib/admin/orders/store";
import { readStoredCustomers } from "@/lib/admin/customers/store";
import { readStoredPromotions } from "@/lib/admin/promotions/store";

export async function getAdminOrders() {
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiOrderSummary>>("/api/v1/orders?page=0&size=200");
    return page.items.map(mapOrder);
  }, readStoredOrders);
}

export async function getAdminCustomers() {
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiCustomer>>("/api/v1/customers?page=0&size=200");
    return page.items.map(mapCustomer);
  }, readStoredCustomers);
}

export async function getAdminPromotions() {
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiPromotion>>("/api/v1/promotions?page=0&size=200");
    return page.items.map(mapPromotion);
  }, readStoredPromotions);
}
