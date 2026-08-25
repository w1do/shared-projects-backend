"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, LayoutGrid, LayoutList } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { ButtonGroup } from "@/components/ui/inputs/button-group";
import { Select } from "@/components/ui/inputs/select";
import { DataGrid } from "@/components/ui/data-display/data-grid";
import { DataTableFooter } from "@/components/shared/data-table/DataTableFooter";
import type { Promotion } from "@/lib/admin/mocks/promotions";
import { getPromotionColumns } from "../promotion-columns";
import { PromotionCard } from "../promotion-card";
import { TYPE_OPTIONS, STATUS_OPTIONS } from "@/components/pages/promotions/config/filters";
import type { TypeFilter, StatusFilter } from "@/components/pages/promotions/config/filters";
import { filterPromotions } from "@/components/pages/promotions/utils";

interface PromotionsPanelProps {
  promotions: Promotion[];
  onViewDetails: (promotion: Promotion) => void;
  onEdit: (promotion: Promotion) => void;
  onToggleStatus: (promotion: Promotion) => void;
  onDelete: (promotion: Promotion) => void;
}

type SortConfig = { field: string; order: "asc" | "desc" } | null;

const compareByField = (a: Promotion, b: Promotion, field: string) => {
  if (field === "endsAt") return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
  if (field === "used") return a.used - b.used;
  if (field === "revenue") return a.revenue - b.revenue;
  return 0;
};

export function PromotionsPanel({
  promotions,
  onViewDetails,
  onEdit,
  onToggleStatus,
  onDelete,
}: PromotionsPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const columns = useMemo(
    () => getPromotionColumns({ onViewDetails, onEdit, onToggleStatus, onDelete }),
    [onViewDetails, onEdit, onToggleStatus, onDelete],
  );

  const filtered = useMemo(
    () => filterPromotions(promotions, { searchTerm, typeFilter, statusFilter }),
    [promotions, searchTerm, typeFilter, statusFilter],
  );

  const sorted = useMemo(() => {
    if (!sortConfig) return filtered;
    const dir = sortConfig.order === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => compareByField(a, b, sortConfig.field) * dir);
  }, [filtered, sortConfig]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage) || 1;

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = useMemo(
    () => sorted.slice(startIndex, startIndex + itemsPerPage),
    [sorted, startIndex, itemsPerPage],
  );

  const handleSort = (field: string) => {
    setSortConfig((current) =>
      current?.field === field
        ? { field, order: current.order === "asc" ? "desc" : "asc" }
        : { field, order: "desc" },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <Input
          placeholder="Search code, title, or channel..."
          startIcon={<Search />}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="max-w-sm w-full"
        />

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            options={TYPE_OPTIONS}
            placeholder="All Types"
            className="w-40"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            options={STATUS_OPTIONS}
            placeholder="All Statuses"
            className="w-40"
          />
          <ButtonGroup
            options={[
              { label: <LayoutList className="size-4" />, value: "table" },
              { label: <LayoutGrid className="size-4" />, value: "grid" },
            ]}
            value={viewMode}
            onChange={(value) => setViewMode(value as "table" | "grid")}
            size="small"
            isIconButton
          />
        </div>
      </div>

      {viewMode === "table" ? (
        <DataGrid
          rows={paginated}
          columns={columns}
          sortConfig={sortConfig}
          onSort={handleSort}
          onRowClick={(row) => onViewDetails(row)}
          emptyState={
            <div className="text-center text-xs text-muted-foreground-lighter py-6">
              No promotions match your filters.
            </div>
          }
        />
      ) : paginated.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border py-12 text-center text-xs text-muted-foreground-lighter">
          No promotions match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginated.map((promo) => (
            <PromotionCard key={promo.id} promotion={promo} onViewDetails={onViewDetails} />
          ))}
        </div>
      )}

      <DataTableFooter
        currentPage={currentPage}
        endItem={Math.min(startIndex + itemsPerPage, sorted.length)}
        itemLabel="promotions"
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(value) => {
          setItemsPerPage(value);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
        startItem={sorted.length > 0 ? startIndex + 1 : 0}
        totalItems={sorted.length}
        totalPages={totalPages}
      />
    </div>
  );
}
