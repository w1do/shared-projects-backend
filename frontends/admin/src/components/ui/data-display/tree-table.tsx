"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/data-display/table";
import type { ColumnDef } from "@/components/ui/data-display/data-grid.types";

/**
 * Таблица дерева с перетаскиванием.
 *
 * Строки — узлы плоского списка в префиксном порядке (родитель, затем его
 * поддерево) с уровнем `depth`. Компонент ничего не знает о предметной области:
 * правила недопустимых целей приходят предикатом, перемещение — колбэком.
 *
 * DnD — нативные drag-события браузера: новые зависимости панели невозможны
 * (bun.lock пересчитать нечем), а для перетаскивания целых строк их достаточно.
 *
 * Зоны броска на строке: верхняя треть — поставить ПЕРЕД строкой (сосед по её
 * уровню), нижняя треть — ПОСЛЕ, середина — ВЛОЖИТЬ в строку. Семантика
 * файловых менеджеров: линия-вставка сверху/снизу, подсветка строки — вложение.
 *
 * Выбор строк — тот же контракт, что у `DataGrid` (`checkbox`, `selectedRowIds`,
 * `onSelectionChange`). Потомки отмеченного узла помечаются как «уйдут вместе с
 * ним», но в `selectedRowIds` не попадают: счётчик выбранного считает только то,
 * что оператор отметил сам.
 */

export interface TreeNodeRow {
  id: string;
  parentId?: string | null;
  depth: number;
}

export type TreeDropZone = "before" | "inside" | "after";

export interface TreeTableProps<T extends TreeNodeRow> {
  rows: T[];
  columns: ColumnDef<T>[];
  /**
   * Перемещение узла: новый родитель (`null` — корень) и позиция среди соседей
   * этого уровня (индекс в списке без самого узла).
   */
  onMove?: (nodeId: string, parentId: string | null, position: number) => void;
  /** Цели, в которые узел вкладывать нельзя (обычно сам узел и его поддерево). */
  isInvalidTarget?: (draggedId: string, targetId: string) => boolean;
  /** Узлы, помеченные «в полёте» (идёт запрос перемещения). */
  busyIds?: Set<string>;
  /** Выключает перетаскивание (например, при активном поиске). */
  dragDisabled?: boolean;
  /** Колонка выбора — контракт тот же, что у DataGrid. */
  checkbox?: boolean;
  selectedRowIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: React.ReactNode;
}

type DropTarget = { id: string; zone: TreeDropZone } | null;

export function TreeTable<T extends TreeNodeRow>({
  rows,
  columns,
  onMove,
  isInvalidTarget,
  busyIds,
  dragDisabled = false,
  checkbox = false,
  selectedRowIds,
  onSelectionChange,
  onRowClick,
  emptyMessage,
}: TreeTableProps<T>) {
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dropTarget, setDropTarget] = React.useState<DropTarget>(null);

  const byId = React.useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);
  const hasChildren = React.useMemo(() => {
    const parents = new Set<string>();
    for (const row of rows) if (row.parentId != null) parents.add(row.parentId);
    return parents;
  }, [rows]);

  /** Строка скрыта, если любой из её предков свёрнут. */
  const visibleRows = React.useMemo(() => {
    if (collapsed.size === 0) return rows;
    return rows.filter((row) => {
      let parentId = row.parentId ?? null;
      while (parentId != null) {
        if (collapsed.has(parentId)) return false;
        parentId = byId.get(parentId)?.parentId ?? null;
      }
      return true;
    });
  }, [rows, collapsed, byId]);

  const selected = React.useMemo(() => selectedRowIds ?? new Set<string>(), [selectedRowIds]);
  const showCheckbox = checkbox && Boolean(onSelectionChange);

  /**
   * Потомки отмеченного узла уйдут вместе с ним, но в выборе не числятся:
   * иначе счётчик выбранного показывал бы больше, чем отметил оператор.
   */
  const impliedIds = React.useMemo(() => {
    if (selected.size === 0) return new Set<string>();
    const implied = new Set<string>();

    for (const row of rows) {
      let parentId = row.parentId ?? null;
      while (parentId != null) {
        if (selected.has(parentId)) {
          implied.add(row.id);
          break;
        }
        parentId = byId.get(parentId)?.parentId ?? null;
      }
    }

    return implied;
  }, [rows, selected, byId]);

  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id));

  const toggleAll = () => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    rows.forEach((row) => (allSelected ? next.delete(row.id) : next.add(row.id)));
    onSelectionChange(next);
  };

  const toggleRow = (id: string) => {
    if (!onSelectionChange) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  };

  const toggleCollapse = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const zoneFor = (event: React.DragEvent<HTMLTableRowElement>): TreeDropZone => {
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = (event.clientY - rect.top) / rect.height;
    if (offset < 1 / 3) return "before";
    if (offset > 2 / 3) return "after";
    return "inside";
  };

  const invalidFor = (targetId: string, zone: TreeDropZone): boolean => {
    if (!draggedId || draggedId === targetId) return true;
    if (!isInvalidTarget) return false;
    // Вложение в поддерево запрещено; вставка рядом с узлом поддерева — тоже
    // (сосед узла поддерева — потомок перетаскиваемого).
    if (zone === "inside") return isInvalidTarget(draggedId, targetId);
    const target = byId.get(targetId);
    const parentId = target?.parentId ?? null;
    return parentId != null && isInvalidTarget(draggedId, parentId);
  };

  /** Позиция среди соседей уровня: индекс цели в списке её родителя без перетаскиваемого узла. */
  const positionFor = (targetId: string, zone: TreeDropZone): number => {
    const target = byId.get(targetId)!;
    const siblings = rows.filter(
      (row) => (row.parentId ?? null) === (target.parentId ?? null) && row.id !== draggedId,
    );
    const index = siblings.findIndex((row) => row.id === targetId);
    return zone === "before" ? index : index + 1;
  };

  const handleDrop = (event: React.DragEvent<HTMLTableRowElement>, targetId: string) => {
    event.preventDefault();
    const zone = zoneFor(event);
    const dragged = draggedId;
    setDropTarget(null);
    setDraggedId(null);

    if (!dragged || !onMove || invalidFor(targetId, zone)) return;

    if (zone === "inside") {
      // Вложение: последним потомком цели.
      const childCount = rows.filter(
        (row) => row.parentId === targetId && row.id !== dragged,
      ).length;
      onMove(dragged, targetId, childCount);
      return;
    }

    const target = byId.get(targetId)!;
    onMove(dragged, target.parentId ?? null, positionFor(targetId, zone));
  };

  return (
    <Table data-testid="tree-table">
      <TableHeader>
        <TableRow>
          {showCheckbox && (
            <TableHead className="w-12 pl-4 md:pl-6">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                aria-label="Select all rows"
                size="small"
              />
            </TableHead>
          )}
          {columns.map((column) => (
            <TableHead
              key={column.field}
              className={cn(column.headerClassName)}
              style={column.width ? { width: column.width } : undefined}
            >
              {column.headerName}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleRows.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={columns.length + (showCheckbox ? 1 : 0)}
              className="py-10 text-center"
            >
              {emptyMessage ?? "No rows."}
            </TableCell>
          </TableRow>
        )}
        {visibleRows.map((row, rowIndex) => {
          const isDragged = draggedId === row.id;
          const isBusy = busyIds?.has(row.id) ?? false;
          const target = dropTarget?.id === row.id ? dropTarget : null;
          const invalid = target ? invalidFor(row.id, target.zone) : false;
          const isSelected = selected.has(row.id);
          const isImplied = impliedIds.has(row.id);

          return (
            <TableRow
              key={row.id}
              data-tree-node={row.id}
              data-tree-depth={row.depth}
              data-state={isSelected ? "selected" : undefined}
              data-tree-implied={isImplied ? "" : undefined}
              data-drop-zone={target && !invalid ? target.zone : undefined}
              data-drop-invalid={target && invalid ? "" : undefined}
              draggable={!dragDisabled && !isBusy && Boolean(onMove)}
              onDragStart={(event) => {
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", row.id);
                setDraggedId(row.id);
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setDropTarget(null);
              }}
              onDragOver={(event) => {
                if (!draggedId || isDragged) return;
                event.preventDefault();
                const zone = zoneFor(event);
                event.dataTransfer.dropEffect = invalidFor(row.id, zone) ? "none" : "move";
                setDropTarget((current) =>
                  current?.id === row.id && current.zone === zone ? current : { id: row.id, zone },
                );
              }}
              onDragLeave={() =>
                setDropTarget((current) => (current?.id === row.id ? null : current))
              }
              onDrop={(event) => handleDrop(event, row.id)}
              onClick={() => onRowClick?.(row)}
              className={cn(
                "relative transition-opacity",
                isDragged && "opacity-40",
                isBusy && "pointer-events-none opacity-50",
                target && !invalid && target.zone === "inside" && "bg-brand-accent/10",
                target &&
                  !invalid &&
                  target.zone === "before" &&
                  "shadow-[inset_0_2px_0_0_var(--color-brand-accent,theme(colors.orange.500))]",
                target &&
                  !invalid &&
                  target.zone === "after" &&
                  "shadow-[inset_0_-2px_0_0_var(--color-brand-accent,theme(colors.orange.500))]",
                target && invalid && "cursor-not-allowed bg-destructive/10",
                isImplied && "bg-destructive/5",
              )}
            >
              {showCheckbox && (
                <TableCell
                  className="pl-4 md:pl-6"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!isImplied) toggleRow(row.id);
                  }}
                >
                  <Checkbox
                    checked={isSelected || isImplied}
                    disabled={isImplied}
                    onCheckedChange={() => toggleRow(row.id)}
                    aria-label={`Select row ${row.id}`}
                    size="small"
                  />
                </TableCell>
              )}
              {columns.map((column, columnIndex) => (
                <TableCell key={column.field} className={cn(column.cellClassName)}>
                  {columnIndex === 0 ? (
                    <div
                      className="flex items-center gap-1"
                      style={
                        row.depth > 0 ? { paddingInlineStart: `${row.depth * 20}px` } : undefined
                      }
                    >
                      {hasChildren.has(row.id) ? (
                        <IconButton
                          type="button"
                          variant="ghost"
                          size="sm"
                          shape="circle"
                          aria-label={collapsed.has(row.id) ? "Expand" : "Collapse"}
                          aria-expanded={!collapsed.has(row.id)}
                          data-tree-toggle={row.id}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleCollapse(row.id);
                          }}
                        >
                          <ChevronRight
                            className={cn(
                              "size-4 transition-transform",
                              !collapsed.has(row.id) && "rotate-90",
                            )}
                          />
                        </IconButton>
                      ) : (
                        <span aria-hidden className="inline-block w-8 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        {column.renderCell
                          ? column.renderCell({
                              row,
                              value: (row as Record<string, unknown>)[column.field],
                              index: rowIndex,
                            })
                          : String((row as Record<string, unknown>)[column.field] ?? "")}
                      </div>
                    </div>
                  ) : column.renderCell ? (
                    column.renderCell({
                      row,
                      value: (row as Record<string, unknown>)[column.field],
                      index: rowIndex,
                    })
                  ) : (
                    String((row as Record<string, unknown>)[column.field] ?? "")
                  )}
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
