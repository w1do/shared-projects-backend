import { getAdminDashboardData } from "@/lib/admin/data-source/admin-data";

export type AdminDashboardData = Awaited<
  ReturnType<typeof getAdminDashboardData>
>;

/**
 * Dashboard payload for TanStack Query.
 * Живой дашборд собирается только из данных платформы (KPI, выручка,
 * топ-страницы, свежие материалы); демо-виджеты каталога сюда не входят.
 */
export async function getDashboardData(): Promise<AdminDashboardData> {
  return getAdminDashboardData();
}
