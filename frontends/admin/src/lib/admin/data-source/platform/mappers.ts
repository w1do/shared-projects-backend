/**
 * Платформа → формы, которые уже понимают мапперы вёрстки (`../mappers`).
 * Так подключение обходится без правок компонентов: меняется только источник данных.
 */

import type { ApiArticle, ApiCategory, ApiCustomer } from "../api-types";
import type { ApiDashboardStats, ApiRevenuePoint } from "../api-types/commerce";
import type { PlatformProjectUser } from "./auth";
import type {
  PlatformCategory,
  PlatformOverviewRow,
  PlatformPost,
  PlatformRevenueRow,
} from "./types";

const num = (value: number | string | undefined) => Number(value ?? 0) || 0;

/** Средняя скорость чтения — 1000 знаков ≈ 1 минута. */
function readingTime(body: string | null | undefined) {
  return Math.max(1, Math.round((body?.length ?? 0) / 1000));
}

/** Тело поста платформы — единый HTML/текст: отдаём одним блоком абзаца. */
export function postToArticle(post: PlatformPost, categoryNames: Map<number, string>): ApiArticle {
  const category = post.categories?.length ? categoryNames.get(post.categories[0]) : undefined;

  return {
    id: String(post.id),
    slug: post.slug,
    title: post.title,
    subtitle: post.seo?.description ?? null,
    category: category ?? null,
    tags: post.seo?.keywords ? post.seo.keywords.split(",").map((tag) => tag.trim()) : [],
    authorName: null,
    readingTimeMin: readingTime(post.body),
    thumbnail: post.seo?.og_image ?? null,
    banner: post.seo?.og_image ?? null,
    status: post.status.toUpperCase() as ApiArticle["status"],
    categoryIds: (post.categories ?? []).map(String),
    contentBlocks: post.body ? [{ type: "paragraph", content: post.body }] : [],
    publishedAt: post.published_at ?? null,
    createdAt: post.published_at ?? undefined,
    updatedAt: post.published_at ?? undefined,
  };
}

/** Дерево категорий платформы → дерево, которое ждёт вёрстка. */
export function categoryToApiCategory(
  category: PlatformCategory,
  displayOrder = 0,
): ApiCategory {
  return {
    id: String(category.id),
    name: category.name,
    nameTranslations: category.name_translations,
    slug: category.slug,
    parentId: category.parent_id === null ? null : String(category.parent_id),
    displayOrder,
    status: "ACTIVE",
    children: (category.children ?? []).map((child, index) =>
      categoryToApiCategory(child, index),
    ),
  };
}

/** Плоский список имён категорий по id — для подписи категории поста. */
export function categoryNameIndex(tree: PlatformCategory[]): Map<number, string> {
  const index = new Map<number, string>();
  const walk = (nodes: PlatformCategory[]) => {
    for (const node of nodes) {
      index.set(node.id, node.name);
      walk(node.children ?? []);
    }
  };
  walk(tree);
  return index;
}

/** Пользователь проекта → карточка клиента вёрстки. */
export function projectUserToCustomer(user: PlatformProjectUser): ApiCustomer {
  const name = user.name ?? user.email;
  return {
    id: String(user.id),
    code: String(user.id),
    name,
    email: user.email,
    // Платформа не ведёт лояльность/заказы — поля остаются нейтральными.
    tier: "SILVER",
    status: user.blocked ? "Inactive" : "Active",
    totalOrders: 0,
    totalSpent: 0,
  };
}

/** Выручка платформы (минорные единицы) → точки графика вёрстки. */
export function revenueToPoints(rows: PlatformRevenueRow[]): ApiRevenuePoint[] {
  const byDate = new Map<string, { revenue: number; payments: number }>();

  for (const row of rows) {
    const current = byDate.get(row.date) ?? { revenue: 0, payments: 0 };
    byDate.set(row.date, {
      // Деньги хранятся в минорных единицах: приводим к основным только для отображения.
      revenue: current.revenue + num(row.revenue_minor) / 100,
      payments: current.payments + num(row.payments),
    });
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({ label: date, revenue: value.revenue, orders: value.payments }));
}

/** Обзор + выручка → KPI-статистика дашборда. */
export function toDashboardStats(
  overview: PlatformOverviewRow[],
  revenue: PlatformRevenueRow[],
): ApiDashboardStats {
  const revenueTotal = revenue.reduce((sum, row) => sum + num(row.revenue_minor) / 100, 0);
  const payments = revenue.reduce((sum, row) => sum + num(row.payments), 0);
  const subjects = overview.reduce((max, row) => Math.max(max, num(row.subjects)), 0);

  return {
    revenue: revenueTotal,
    orders: payments,
    averageOrderValue: payments > 0 ? revenueTotal / payments : 0,
    customers: subjects,
    pendingOrders: 0,
  };
}
