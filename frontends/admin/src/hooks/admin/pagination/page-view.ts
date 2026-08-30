/**
 * Правила пагинации списка — чистые функции, поэтому покрыты node-тестом.
 * Состояние страницы живёт в `usePagination`, здесь только вычисления.
 */

export interface PageView<T> {
  page: number;
  totalPages: number;
  totalItems: number;
  items: T[];
  startItem: number;
  endItem: number;
}

/**
 * Страница, которую можно показать: пересобранный список читается с начала,
 * а страница за пределами списка приводится к последней существующей.
 */
export function nextPage(page: number, listChanged: boolean, totalPages: number): number {
  if (listChanged) return 1;

  return Math.min(Math.max(page, 1), totalPages);
}

export function totalPagesOf(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/** Срез страницы вместе с диапазоном записей для подвала списка. */
export function pageView<T>(
  items: T[],
  page: number,
  pageSize: number,
  listChanged = false,
): PageView<T> {
  const totalItems = items.length;
  const totalPages = totalPagesOf(totalItems, pageSize);
  const current = nextPage(page, listChanged, totalPages);
  const start = (current - 1) * pageSize;

  return {
    page: current,
    totalPages,
    totalItems,
    items: items.slice(start, start + pageSize),
    startItem: totalItems === 0 ? 0 : start + 1,
    endItem: Math.min(start + pageSize, totalItems),
  };
}
