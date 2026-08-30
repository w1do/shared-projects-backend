import { Select } from "@/components/ui/inputs/select";
import { Pagination } from "@/components/shared/data-table/Pagination";
import type { PaginationState } from "@/hooks/admin/pagination";

const DEFAULT_PAGE_SIZES = [8, 16, 24, 32];

interface DataTableFooterProps<T> {
  pagination: PaginationState<T>;
  itemLabel: string;
  pageSizes?: number[];
}

export function DataTableFooter<T>({
  pagination,
  itemLabel,
  pageSizes = DEFAULT_PAGE_SIZES,
}: DataTableFooterProps<T>) {
  if (pagination.totalItems === 0) return null;

  const pageSizeOptions = pageSizes.map((value) => ({
    value: String(value),
    label: String(value),
  }));

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground-lighter sm:flex-row">
      <div className="flex items-center gap-2">
        <span>Show</span>
        <Select
          value={String(pagination.pageSize)}
          onChange={(e) => pagination.setPageSize(Number(e.target.value))}
          options={pageSizeOptions}
          className="w-20"
        />
        <span className="mx-2 text-muted-foreground">|</span>
        <span>
          Showing {pagination.startItem}–{pagination.endItem} of {pagination.totalItems}{" "}
          {itemLabel}
        </span>
      </div>
      <Pagination
        count={pagination.totalPages}
        page={pagination.page}
        onChange={pagination.setPage}
      />
    </div>
  );
}
