"use client";

import { useMemo, useState, ChangeEvent } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import type { InventoryItem } from "@/lib/admin/mocks/types";
import { getInventoryColumns } from "../inventory-columns";
import { Select } from "@/components/ui/inputs/select";

interface InventoryPanelProps {
  items: InventoryItem[];
  onEditClick: (item: InventoryItem) => void;
  onQuickAdjust: (id: string, delta: number) => void;
}

type SortConfig = { field: string; order: "asc" | "desc" } | null;

const descendingFirstFields = new Set(["stock", "value", "price", "incoming"]);

function getSortValue(item: InventoryItem, field: string): string | number {
  if (field === "value") return item.stock * item.price;
  return item[field as keyof InventoryItem] as string | number;
}

export function InventoryPanel({ items, onEditClick, onQuickAdjust }: InventoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: "stock", order: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const uniqueBrands = useMemo(() => Array.from(new Set(items.map((i) => i.brand))), [items]);

  const columns = useMemo(
    () => getInventoryColumns({ onEditClick, onQuickAdjust }),
    [onEditClick, onQuickAdjust],
  );

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Low Stock" && item.stock > 0 && item.stock <= item.threshold) ||
      (statusFilter === "Out of Stock" && item.stock === 0) ||
      (statusFilter === "In Stock" && item.stock > item.threshold);
    return matchesSearch && matchesStatus && (brandFilter === "all" || item.brand === brandFilter);
  });

  const sorted = useMemo(() => {
    if (!sortConfig) return filtered;
    const { field, order } = sortConfig;
    const factor = order === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const valueA = getSortValue(a, field);
      const valueB = getSortValue(b, field);
      if (typeof valueA === "string" && typeof valueB === "string") {
        return valueA.localeCompare(valueB) * factor;
      }
      if (typeof valueA === "number" && typeof valueB === "number") {
        return (valueA - valueB) * factor;
      }
      return 0;
    });
  }, [filtered, sortConfig]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startItem = sorted.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, sorted.length);
  const paginatedItems = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: string) => {
    setSortConfig((current) => {
      if (current?.field !== field) {
        return { field, order: descendingFirstFields.has(field) ? "desc" : "asc" };
      }
      if (current.order === "asc") return { field, order: "desc" };
      if (current.order === "desc") return { field, order: "asc" };
      return null;
    });
  };

  const handleFilterChange =
    (setter: (val: string) => void) => (e: ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setCurrentPage(1);
    };

  const statusOptions = ["all", "In Stock", "Low Stock", "Out of Stock"].map((s) => ({
    value: s,
    label: s === "all" ? "All Statuses" : s,
  }));

  const brandOptions = [
    { value: "all", label: "All Brands" },
    ...uniqueBrands.map((b) => ({ value: b, label: b })),
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search SKU or name..."
          startIcon={<Search />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm w-full"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={statusFilter}
            options={statusOptions}
            onChange={handleFilterChange(setStatusFilter)}
            placeholder="All Statuses"
            className="w-40"
          />
          <Select
            value={brandFilter}
            options={brandOptions}
            onChange={handleFilterChange(setBrandFilter)}
            placeholder="All Brands"
            className="w-40"
          />
        </div>
      </div>

      <DataGrid
        rows={paginatedItems}
        columns={columns}
        sortConfig={sortConfig}
        onSort={handleSort}
        emptyState={
          <div className="py-6 text-center text-xs text-muted-foreground-lighter">
            No inventory items found.
          </div>
        }
      />

      <DataTableFooter
        currentPage={currentPage}
        endItem={endItem}
        itemLabel="items"
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
        startItem={startItem}
        totalItems={sorted.length}
        totalPages={totalPages}
      />
    </div>
  );
}
