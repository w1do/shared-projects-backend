"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/layout/scroll-area";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { getImportColumns } from "./ImportColumns";
import type { ParsedItem } from "@/lib/admin/inventory-import-helpers";

interface ImportPreviewTableProps {
  parsedItems: ParsedItem[];
  selectedIds: string[];
  onToggleSelectAll: () => void;
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
}

export function ImportPreviewTable({
  parsedItems,
  selectedIds,
  onToggleSelectAll,
  onToggleItem,
  onRemoveItem,
}: ImportPreviewTableProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(parsedItems.length / itemsPerPage);

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [parsedItems.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, parsedItems.length);
  const currentPageItems = parsedItems.slice(startIndex, endIndex);

  const selectedRowIds = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const handleSelectionChange = React.useCallback(
    (nextSelected: Set<string>) => {
      const diff = parsedItems
        .filter((i) => selectedRowIds.has(i.id) !== nextSelected.has(i.id))
        .map((i) => i.id);
      if (diff.length > 1) {
        onToggleSelectAll();
      } else if (diff.length === 1) {
        onToggleItem(diff[0]);
      }
    },
    [parsedItems, selectedRowIds, onToggleSelectAll, onToggleItem],
  );

  const columns = React.useMemo(
    () => getImportColumns({ onRemoveItem, showFile: parsedItems.length > 1 }),
    [parsedItems.length, onRemoveItem],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-inner [&_tr.is-invalid_button[role=checkbox]]:pointer-events-none [&_tr.is-invalid_button[role=checkbox]]:opacity-50">
      <ScrollArea>
        <DataGrid
          rows={currentPageItems}
          columns={columns}
          checkboxSelection
          selectedRowIds={selectedRowIds}
          onSelectionChange={handleSelectionChange}
          variant="plain"
          rowClassName={(row) => (!row.isValid ? "is-invalid bg-destructive/5" : "")}
        />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border bg-muted/10 p-4 font-openrunde text-caption">
          <div className="text-muted-foreground">
            Showing <strong>{startIndex + 1}</strong>–<strong>{endIndex}</strong> of{" "}
            <strong>{parsedItems.length}</strong> items
          </div>
          <div className="flex items-center gap-2">
            <IconButton
              type="button"
              variant="outlined"
              size="sm"
              shape="circle"
              aria-label="Previous page"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="size-4" />
            </IconButton>
            <span className="min-w-8 text-center font-mono font-medium text-foreground">
              {currentPage} / {totalPages}
            </span>
            <IconButton
              type="button"
              variant="outlined"
              size="sm"
              shape="circle"
              aria-label="Next page"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="size-4" />
            </IconButton>
          </div>
        </div>
      )}
    </div>
  );
}
