/**
 * Честные KPI раздела «Блог»: показатели считаются из реально загруженного
 * списка статей — без зашитых дельт, трендов и спарклайнов.
 *
 * Модуль чистый (без импортов): его тянут и компоненты панели, и юнит-тесты
 * `node --test` с нативным срезанием типов.
 */

/** Минимальный срез статьи, достаточный для подсчёта показателей. */
export type BlogsKpiArticle = {
  /** Статус поста платформы; у демо-данных вёрстки отсутствует. */
  status?: string;
  category: string;
  author: { name: string };
  readingTimeMin: number;
};

export type BlogsKpiValues = {
  /**
   * Опубликованные статьи. Если статусов нет ни у одной статьи (демо-данные
   * вёрстки), опубликованным считается весь список.
   */
  publishedCount: number;
  /** Уникальные рубрики статей. */
  categoriesCount: number;
  /** Уникальные авторы по имени. */
  authorsCount: number;
  /** Среднее время чтения в минутах, округлённое до целого; 0 без статей. */
  averageReadMinutes: number;
};

export function computeBlogsKpiValues(
  articles: readonly BlogsKpiArticle[],
): BlogsKpiValues {
  const hasStatuses = articles.some((article) => article.status !== undefined);
  const publishedCount = hasStatuses
    ? articles.filter((article) => article.status === "published").length
    : articles.length;

  const categoriesCount = new Set(articles.map((article) => article.category))
    .size;
  const authorsCount = new Set(articles.map((article) => article.author.name))
    .size;

  const averageReadMinutes =
    articles.length > 0
      ? Math.round(
          articles.reduce((sum, article) => sum + article.readingTimeMin, 0) /
            articles.length,
        )
      : 0;

  return { publishedCount, categoriesCount, authorsCount, averageReadMinutes };
}
