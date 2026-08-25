import { adminApiSend } from "../api-client";

export const operationsMutations = {
  updateOrderStatus: (id: string, status: string) =>
    adminApiSend(`/api/v1/orders/${id}/status`, {
      method: "PATCH",
      body: { status: status.toUpperCase() },
    }),
  updateInventory: (variantId: string, body: unknown) =>
    adminApiSend(`/api/v1/inventory/${variantId}`, { method: "PATCH", body }),
  adjustInventory: (variantId: string, quantityDelta: number) =>
    adminApiSend(`/api/v1/inventory/${variantId}/adjust`, {
      method: "POST",
      body: { quantityDelta, reason: "Admin quick adjustment" },
    }),
  markNotificationRead: (id: string) =>
    adminApiSend(`/api/v1/notifications/${id}/read`, { method: "PATCH" }),
  markAllNotificationsRead: () =>
    adminApiSend("/api/v1/notifications/read-all", { method: "PATCH" }),
  updateTicketStatus: (id: string, status: string) =>
    adminApiSend(`/api/v1/support/tickets/${id}/status`, {
      method: "PATCH",
      body: { status: status.toUpperCase() },
    }),
  addTicketMessage: (id: string, body: string) =>
    adminApiSend(`/api/v1/support/tickets/${id}/messages`, {
      method: "POST",
      body: { author: "AGENT", authorName: "Admin", body },
    }),
};
