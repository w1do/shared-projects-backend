/** analytics-service: обзор, топ-страницы, выручка за период. */

import { adminApiGet } from "../api-client";
import type { PlatformOverviewRow, PlatformRevenueRow, PlatformTopPageRow } from "./types";

const base = "/api/admin/v1/projects/{project}/analytics";

export type Period = { from: string; to: string };

/** Период по умолчанию — последние 30 дней, как и на бекенде. */
export function defaultPeriod(days = 30): Period {
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

function query(period: Period) {
  return `?from=${period.from}&to=${period.to}`;
}

export function getOverview(period: Period = defaultPeriod()) {
  return adminApiGet<PlatformOverviewRow[]>(`${base}/overview${query(period)}`);
}

export function getTopPages(period: Period = defaultPeriod()) {
  return adminApiGet<PlatformTopPageRow[]>(`${base}/top-pages${query(period)}`);
}

export function getRevenue(period: Period = defaultPeriod()) {
  return adminApiGet<PlatformRevenueRow[]>(`${base}/revenue${query(period)}`);
}
