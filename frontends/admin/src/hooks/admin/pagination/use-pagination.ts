"use client";

import * as React from "react";
import { pageView, type PageView } from "./page-view";

export interface PaginationState<T> extends PageView<T> {
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

/**
 * Пагинация списка раздела: страница, размер страницы и срез данных.
 * Раздел подключает её одной строкой и передаёт результат в `DataTableFooter`.
 */
export function usePagination<T>(
  items: T[],
  initialPageSize = 8,
): PaginationState<T> {
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSizeState] = React.useState(initialPageSize);

  const previousItems = React.useRef(items);
  const listChanged = previousItems.current !== items;
  previousItems.current = items;

  const view = pageView(items, page, pageSize, listChanged);

  React.useEffect(() => {
    if (view.page !== page) setPage(view.page);
  }, [view.page, page]);

  return {
    ...view,
    pageSize,
    setPage,
    setPageSize: (size: number) => {
      setPageSizeState(size);
      setPage(1);
    },
  };
}
