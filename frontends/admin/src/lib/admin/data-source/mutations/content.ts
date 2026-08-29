import { adminApiSend } from "../api-client";
import type { ApiPromotion } from "../api-types";
import * as platformContent from "../platform/content";
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

type ArticleBody = {
  title: string;
  subtitle: string;
  category: string;
  /** Категории проекта, к которым привязывается пост. */
  categoryIds?: string[];
  tags?: string;
  authorName: string;
  authorRole: string;
  readingTimeMin: number;
  banner?: string;
  thumbnail?: string;
  /** Медиа проекта за обложкой и баннером; `null` снимает изображение. */
  coverMediaId?: number | null;
  bannerMediaId?: number | null;
  contentBlocks: Array<{ type: string; content: string }>;
};

/** Блоки вёрстки → тело поста платформы (посты хранят единый текст). */
function toPostBody(body: ArticleBody, options: { withSlug?: boolean } = {}) {
  return {
    title: body.title,
    // Slug задаётся один раз при создании: перегенерация при правке заголовка
    // молча меняла бы адрес уже существующего поста.
    ...(options.withSlug ? { slug: slugify(body.title) } : {}),
    body: body.contentBlocks
      .map((block) => (block.type === "heading" ? `<h2>${block.content}</h2>` : block.content))
      .filter(Boolean)
      .join("\n\n"),
    ...(body.categoryIds ? { categories: body.categoryIds.map(Number) } : {}),
    // Ключ уходит всегда: `null` — осознанное снятие изображения поста
    cover_media_id: body.coverMediaId ?? null,
    banner_media_id: body.bannerMediaId ?? null,
  };
}

/** SEO-часть формы поста: описание/ключевые слова/обложка. */
function toPostSeo(body: ArticleBody) {
  return {
    title: body.title,
    description: body.subtitle || null,
    keywords: body.tags || null,
    og_image: body.banner || body.thumbnail || null,
  };
}

export const contentMutations = {
  /**
   * blogs → content-service: пост создаётся черновиком.
   * Публикация — отдельное действие оператора, а не побочный эффект сохранения.
   */
  createArticle: async (body: ArticleBody) => {
    const post = await platformContent.createPost(toPostBody(body, { withSlug: true }));
    await platformContent.updateSeo("post", post.id, toPostSeo(body));
    return post;
  },
  updateArticle: async (id: string, body: ArticleBody) => {
    const post = await platformContent.updatePost(Number(id), toPostBody(body));
    await platformContent.updateSeo("post", post.id, toPostSeo(body));
    return post;
  },
  /** Смена статуса поста (публикация/черновик/архив). */
  deleteArticle: (id: string) => platformContent.deletePost(Number(id)),

  // Медиатека проекта: загрузка файла, импорт по ссылке и подбор изображения.
  uploadMedia: (file: File, alt?: string) => platformContent.uploadMedia(file, alt),
  importMedia: (url: string, alt?: string) => platformContent.importMedia(url, alt),
  searchImages: (query: string, limit?: number) => platformContent.searchImages(query, limit),

  changeArticleStatus: (id: string, status: string, scheduledAt?: string) =>
    platformContent.changePostStatus(Number(id), status, scheduledAt),
  restoreArticleRevision: (id: string, revisionId: string) =>
    platformContent.restorePostRevision(Number(id), Number(revisionId)),
  listArticleRevisions: (id: string) => platformContent.listPostRevisions(Number(id)),
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
