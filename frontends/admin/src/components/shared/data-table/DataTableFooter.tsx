import { Select } from "@/components/ui/inputs/select";
import { Pagination } from "@/components/shared/data-table/Pagination";

const DEFAULT_PAGE_SIZES = [8, 16, 24, 32];

interface DataTableFooterProps {
  currentPage: number;
  endItem: number;
  itemLabel: string;
  itemsPerPage: number;
  onItemsPerPageChange: (value: number) => void;
  onPageChange: (page: number) => void;
  startItem: number;
  totalItems: number;
  totalPages: number;
  pageSizes?: number[];
}

export function DataTableFooter({
  currentPage,
  endItem,
  itemLabel,
  itemsPerPage,
  onItemsPerPageChange,
  onPageChange,
  startItem,
  totalItems,
  totalPages,
  pageSizes = DEFAULT_PAGE_SIZES,
}: DataTableFooterProps) {
  if (totalItems === 0) return null;

  const pageSizeOptions = pageSizes.map((value) => ({
    value: String(value),
    label: String(value),
  }));

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-6 text-xs text-muted-foreground-lighter sm:flex-row">
      <div className="flex items-center gap-2">
        <span>Show</span>
        <Select
          value={String(itemsPerPage)}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          options={pageSizeOptions}
          className="w-20"
        />
        <span className="mx-2 text-muted-foreground">|</span>
        <span>
          Showing {startItem}–{endItem} of {totalItems} {itemLabel}
        </span>
      </div>
      <Pagination count={totalPages} page={currentPage} onChange={onPageChange} />
    </div>
  );
}
