"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-display/table";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnDef, DataGridProps } from "./data-grid.types";

export type { ColumnDef, DataGridProps };

export function DataGrid<T extends { id: string }>({
  rows,
  columns,
  checkboxSelection = false,
  checkbox,
  selectedRowIds = new Set(),
  onSelectionChange,
  sortConfig,
  onSort,
  emptyState,
  rowClassName,
  onRowClick,
  variant = "default",
  className,
}: DataGridProps<T>) {
  const showCheckbox = checkbox !== undefined ? checkbox : checkboxSelection;
  const allSelected = rows.length > 0 && rows.every((row) => selectedRowIds.has(row.id));

  const rawId = React.useId();
  const gridId = React.useMemo(() => rawId.replace(/:/g, ""), [rawId]);

  const handleToggleAll = React.useCallback(() => {
    if (onSelectionChange) {
      const next = new Set(selectedRowIds);
      rows.forEach((row) => {
        if (allSelected) {
          next.delete(row.id);
        } else {
          next.add(row.id);
        }
      });
      onSelectionChange(next);
    }
  }, [rows, allSelected, onSelectionChange, selectedRowIds]);

  const handleToggleRow = React.useCallback(
    (id: string) => {
      if (!onSelectionChange) return;
      const next = new Set(selectedRowIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      onSelectionChange(next);
    },
    [selectedRowIds, onSelectionChange],
  );

  const getAlignClass = (a?: "left" | "right" | "center") =>
    a === "right"
      ? "text-right justify-end"
      : a === "center"
        ? "text-center justify-center"
        : "text-left justify-start";

  // Generate dynamic column styles dynamically to avoid using inline styles which are banned by linter rules
  const styleTagContent = React.useMemo(() => {
    return columns
      .map((col) => {
        if (!col.width) return "";
        const widthStyle = typeof col.width === "number" ? `${col.width}px` : col.width;
        return `
          #grid-${gridId} .col-${col.field} {
            width: ${widthStyle};
            min-width: ${widthStyle};
            max-width: ${widthStyle};
          }
        `;
      })
      .filter(Boolean)
      .join("\n");
  }, [columns, gridId]);

  return (
    <div
      id={`grid-${gridId}`}
      className={cn(
        "min-w-0 overflow-x-auto",
        variant === "default" &&
          "rounded-(--radius-3xl) bg-background py-4 md:py-6 shadow-subtle-3",
        className,
      )}
    >
      {styleTagContent && <style dangerouslySetInnerHTML={{ __html: styleTagContent }} />}
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            {showCheckbox && (
              <TableHead className="w-12 pl-4 md:pl-6 h-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleToggleAll}
                  aria-label="Select all rows"
                  size="small"
                />
              </TableHead>
            )}
            {columns.map((col) => {
              const active = sortConfig?.field === col.field;
              const isSortable = col.sortable && onSort;

              return (
                <TableHead
                  key={col.field}
                  className={cn(
                    "h-12 text-xs font-semibold text-muted-foreground-lighter select-none",
                    `col-${col.field}`,
                    isSortable && "cursor-pointer hover:text-foreground transition-colors group",
                    col.headerClassName,
                  )}
                  onClick={() => isSortable && onSort(col.field)}
                >
                  <div className={cn("flex items-center gap-1", getAlignClass(col.align))}>
                    <span>{col.headerName}</span>
                    {isSortable && (
                      <div className="shrink-0">
                        {active ? (
                          sortConfig.order === "asc" ? (
                            <ArrowUp size={14} className="text-foreground" />
                          ) : (
                            <ArrowDown size={14} className="text-foreground" />
                          )
                        ) : (
                          <ArrowUpDown
                            size={14}
                            className="opacity-0 group-hover:opacity-40 transition-opacity"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow className="hover:bg-transparent border-0">
              <TableCell colSpan={columns.length + (showCheckbox ? 1 : 0)} className="py-12">
                {emptyState || (
                  <div className="text-center text-sm text-muted-foreground">No data available</div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, index) => {
              const isSelected = selectedRowIds.has(row.id);
              const customRowClass =
                typeof rowClassName === "function" ? rowClassName(row) : rowClassName;

              return (
                <TableRow
                  key={row.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={cn("border-border/40 cursor-pointer select-none", customRowClass)}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!e.currentTarget.contains(target)) return;

                    const isInteractive =
                      target.closest("button, a, input, select, textarea, [role='button']") ||
                      target.closest(".col-actions");

                    if (isInteractive) return;

                    if (onRowClick) {
                      onRowClick(row, e);
                    } else if (showCheckbox && onSelectionChange) {
                      handleToggleRow(row.id);
                    }
                  }}
                >
                  {showCheckbox && (
                    <TableCell
                      className="py-4 pl-4 md:pl-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleRow(row.id);
                      }}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleRow(row.id)}
                        aria-label={`Select row ${row.id}`}
                        size="small"
                      />
                    </TableCell>
                  )}
                  {columns.map((col) => {
                    const value = row[col.field as keyof T];
                    return (
                      <TableCell
                        key={col.field}
                        className={cn(
                          "py-4 text-sm text-foreground",
                          `col-${col.field}`,
                          col.align === "right" && "text-right",
                          col.align === "center" && "text-center",
                          col.cellClassName,
                        )}
                      >
                        {col.renderCell ? (
                          col.renderCell({ row, value, index })
                        ) : (
                          <span>{String(value ?? "")}</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
