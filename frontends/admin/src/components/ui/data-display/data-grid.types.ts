import * as React from "react";

export interface ColumnDef<T> {
  field: string;
  headerName: string;
  width?: string | number;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  renderCell?: (params: { row: T; value: unknown; index: number }) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataGridProps<T extends { id: string }> {
  rows: T[];
  columns: ColumnDef<T>[];
  checkboxSelection?: boolean;
  checkbox?: boolean;
  selectedRowIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  sortConfig?: { field: string; order: "asc" | "desc" } | null;
  onSort?: (field: string) => void;
  emptyState?: React.ReactNode;
  rowClassName?: string | ((row: T) => string);
  onRowClick?: (row: T, event: React.MouseEvent) => void;
  variant?: "default" | "plain";
  className?: string;
}
