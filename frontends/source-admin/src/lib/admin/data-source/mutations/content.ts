import { adminApiSend } from "../api-client";
import type { ApiArticle, ApiPromotion } from "../api-types";
import { enumValue, slugify } from "./shared";

/**
 * TODO(API): aetheria-backend has PromotionController / ArticleController but
 * no CampaignController. Campaign mutation stubs reject until endpoints exist
 * (expected: POST/PUT/DELETE /api/v1/campaigns[/{id}]).
 */
function campaignsApiUnavailable(action: string): never {
  throw new Error(
    `Campaigns API ${action} is not implemented yet (no /api/v1/campaigns on backend). Use mock data source or add the campaign module server-side.`,
  );
}

export const contentMutations = {
  createArticle: (body: {
    title: string;
    subtitle: string;
    category: string;
    tags?: string;
    authorName: string;
    authorRole: string;
    readingTimeMin: number;
    banner?: string;
    thumbnail?: string;
    contentBlocks: Array<{ type: string; content: string }>;
  }) =>
    adminApiSend<ApiArticle>("/api/v1/articles", {
      method: "POST",
      body: {
        slug: slugify(body.title),
        title: body.title,
        subtitle: body.subtitle,
        category: body.category,
        tags:
          body.tags
            ?.split(",")
            .map((tag) => tag.trim())
            .filter(Boolean) ?? [],
        authorName: body.authorName,
        authorRole: body.authorRole,
        readingTimeMin: body.readingTimeMin,
        banner: body.banner || null,
        thumbnail: body.thumbnail || null,
        status: "PUBLISHED",
        contentBlocks: body.contentBlocks,
      },
    }),
  updateArticle: (
    id: string,
    body: {
      title: string;
      subtitle: string;
      category: string;
      tags?: string;
      authorName: string;
      authorRole: string;
      readingTimeMin: number;
      banner?: string;
      thumbnail?: string;
      contentBlocks: Array<{ type: string; content: string }>;
    },
  ) =>
    adminApiSend<ApiArticle>(`/api/v1/articles/${id}`, {
      method: "PUT",
      body: {
        slug: slugify(body.title),
        title: body.title,
        subtitle: body.subtitle,
        category: body.category,
        tags:
          body.tags
            ?.split(",")
            .map((tag) => tag.trim())
            .filter(Boolean) ?? [],
        authorName: body.authorName,
        authorRole: body.authorRole,
        readingTimeMin: body.readingTimeMin,
        banner: body.banner || null,
        thumbnail: body.thumbnail || null,
        status: "PUBLISHED",
        contentBlocks: body.contentBlocks,
      },
    }),
  createPromotion: (body: {
    code: string;
    title: string;
    type: string;
    rewardValue: number;
    minSpend: number;
    limit: number;
    used?: number;
    status: string;
    startsAt: string;
    endsAt: string;
  }) =>
    adminApiSend<ApiPromotion>("/api/v1/promotions", {
      method: "POST",
      body: {
        code: body.code,
        title: body.title,
        type: enumValue(body.type),
        rewardValue: body.rewardValue,
        minSpend: body.minSpend,
        usageLimit: body.limit,
        used: body.used ?? 0,
        status: enumValue(body.status),
        startsAt: body.startsAt,
        endsAt: body.endsAt,
      },
    }),
  updatePromotion: (
    id: string,
    body: {
      code: string;
      title: string;
      type: string;
      rewardValue: number;
      minSpend: number;
      limit: number;
      used?: number;
      status: string;
      startsAt: string;
      endsAt: string;
    },
  ) =>
    adminApiSend<ApiPromotion>(`/api/v1/promotions/${id}`, {
      method: "PUT",
      body: {
        code: body.code,
        title: body.title,
        type: enumValue(body.type),
        rewardValue: body.rewardValue,
        minSpend: body.minSpend,
        usageLimit: body.limit,
        used: body.used ?? 0,
        status: enumValue(body.status),
        startsAt: body.startsAt,
        endsAt: body.endsAt,
      },
    }),
  deletePromotion: (id: string) =>
    adminApiSend<void>(`/api/v1/promotions/${id}`, { method: "DELETE" }),
  updatePromotionStatus: (id: string, status: string) =>
    adminApiSend(`/api/v1/promotions/${id}/status`, {
      method: "PATCH",
      body: { status: enumValue(status) },
    }),

  // --- Campaign stubs (no backend endpoint yet) ---
  createCampaign: async (_body: {
    name: string;
    description: string;
    status: string;
    channel: string;
    budget: number;
    startsAt: string;
    endsAt: string;
    promotionIds: string[];
    collectionIds: string[];
    banner: string;
    thumbnail: string;
  }) => campaignsApiUnavailable("create"),
  updateCampaign: async (
    _id: string,
    _body: {
      name: string;
      description: string;
      status: string;
      channel: string;
      budget: number;
      startsAt: string;
      endsAt: string;
      promotionIds: string[];
      collectionIds: string[];
      banner: string;
      thumbnail: string;
    },
  ) => campaignsApiUnavailable("update"),
  deleteCampaign: async (_id: string) => campaignsApiUnavailable("delete"),
};
