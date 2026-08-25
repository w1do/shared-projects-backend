import { initialCampaigns } from "@/lib/admin/mocks/campaigns-data";
import { findStoredCampaign, readStoredCampaigns } from "@/lib/admin/campaigns/store";
import { readStoredNotifications } from "@/lib/admin/notifications/store";
import { readStoredSupportTickets } from "@/lib/admin/support/store";
import { readStoredArticles } from "@/lib/admin/articles/store";
import { mapArticle } from "../mappers";
import * as platformContent from "../platform/content";
import { categoryNameIndex, postToArticle } from "../platform/mappers";
import { fromSource, mockOnly } from "./shared";

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

/** Уведомлений в платформе нет — раздел работает на демо-данных вёрстки. */
export async function getAdminNotifications() {
  return mockOnly(readStoredNotifications);
}

/** Поддержки в платформе нет — раздел работает на демо-данных вёрстки. */
export async function getAdminSupportTickets() {
  return mockOnly(readStoredSupportTickets);
}

/** blogs → content-service: посты проекта. */
export async function getAdminArticles() {
  return fromSource(async () => {
    const [posts, tree] = await Promise.all([platformContent.listPosts(), platformContent.listCategories()]);
    const names = categoryNameIndex(tree);
    return posts.map((post) => mapArticle(postToArticle(post, names)));
  }, readStoredArticles);
}

export async function getAdminArticleBySlug(slug: string) {
  return fromSource(
    async () => {
      const [posts, tree] = await Promise.all([
        platformContent.listPosts(),
        platformContent.listCategories(),
      ]);
      const names = categoryNameIndex(tree);
      const post = posts.find(
        (item) =>
          item.slug.toLowerCase() === slug.toLowerCase() || String(item.id) === slug,
      );
      if (!post) return null;
      // Детальный ответ несёт seo и категории — берём его для полной карточки.
      const full = await platformContent.getPost(post.id);
      return mapArticle(postToArticle(full, names));
    },
    () =>
      readStoredArticles().find(
        (article) =>
          article.slug.toLowerCase() === slug.toLowerCase() ||
          article.id.toLowerCase() === slug.toLowerCase(),
      ) ?? null,
  );
}

/** Ревизии поста — история изменений раздела blogs. */
export async function getAdminArticleRevisions(id: string) {
  return fromSource(
    () => platformContent.listPostRevisions(Number(id)),
    () => [],
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
