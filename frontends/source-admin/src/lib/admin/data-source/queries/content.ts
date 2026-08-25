import { initialCampaigns } from "@/lib/admin/mocks/campaigns-data";
import { findStoredCampaign, readStoredCampaigns } from "@/lib/admin/campaigns/store";
import { readStoredNotifications } from "@/lib/admin/notifications/store";
import { readStoredSupportTickets } from "@/lib/admin/support/store";
import { readStoredArticles } from "@/lib/admin/articles/store";
import { adminApiGet, type ApiPage } from "../api-client";
import type { ApiArticle, ApiNotification, ApiSupportTicket } from "../api-types";
import { mapArticle, mapNotification, mapSupportTicket } from "../mappers";
import { fromSource } from "./shared";

/**
 * TODO(API): Backend currently has no campaign controllers/endpoints
 * (no /api/v1/campaigns). Reads fall back to the mock store until campaign
 * CRUD is added server-side; then replace `campaignsFromMockStore` with
 * adminApiGet + mappers.
 */
function campaignsFromMockStore() {
  return typeof window !== "undefined" ? readStoredCampaigns() : [...initialCampaigns];
}

function campaignFromMockStore(id: string) {
  if (typeof window !== "undefined") {
    return findStoredCampaign(id);
  }
  return (
    initialCampaigns.find((campaign) => campaign.id.toLowerCase() === id.toLowerCase()) ?? null
  );
}

export async function getAdminNotifications() {
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiNotification>>(
      "/api/v1/notifications?page=0&size=200",
    );
    return page.items.map(mapNotification);
  }, readStoredNotifications);
}

export async function getAdminSupportTickets() {
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiSupportTicket>>(
      "/api/v1/support/tickets?page=0&size=200",
    );
    return page.items.map(mapSupportTicket);
  }, readStoredSupportTickets);
}

export async function getAdminArticles() {
  return fromSource(async () => {
    const page = await adminApiGet<ApiPage<ApiArticle>>("/api/v1/articles?page=0&size=200");
    return page.items.map(mapArticle);
  }, readStoredArticles);
}

export async function getAdminArticleBySlug(slug: string) {
  return fromSource(
    async () => mapArticle(await adminApiGet<ApiArticle>(`/api/v1/articles/${slug}`)),
    () =>
      readStoredArticles().find(
        (article) =>
          article.slug.toLowerCase() === slug.toLowerCase() ||
          article.id.toLowerCase() === slug.toLowerCase(),
      ) ?? null,
  );
}

/**
 * Single entrypoint for campaign list reads (mock | API).
 * Mock: localStorage-backed store on the client; seed data on the server.
 * API: no backend route yet — intentionally falls back to the mock store so
 * the campaigns UI still works when other modules use API mode.
 */
export async function getAdminCampaigns() {
  return fromSource(async () => campaignsFromMockStore(), campaignsFromMockStore);
}

export async function getAdminCampaignById(id: string) {
  return fromSource(
    async () => campaignFromMockStore(id),
    () => campaignFromMockStore(id),
  );
}
