"use client";

import { Search, LayoutGrid, LayoutList } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Select } from "@/components/ui/inputs/select";
import { ButtonGroup } from "@/components/ui/inputs/button-group";
import {
  brandPerformanceFilterOptions,
  type BrandPerformanceFilter,
} from "@/lib/admin/brands/table-state";

interface BrandsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterDelta: BrandPerformanceFilter;
  onFilterDeltaChange: (value: BrandPerformanceFilter) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (value: "table" | "grid") => void;
}

export function BrandsToolbar({
  searchTerm,
  onSearchChange,
  filterDelta,
  onFilterDeltaChange,
  viewMode,
  onViewModeChange,
}: BrandsToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-sm w-full">
        <Input
          placeholder="Search brands..."
          startIcon={<Search />}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-4">
        <Select
          value={filterDelta}
          onChange={(e) => onFilterDeltaChange(e.target.value as BrandPerformanceFilter)}
          options={brandPerformanceFilterOptions}
          className="w-44"
        />
        <ButtonGroup
          options={[
            { label: <LayoutList className="size-4" />, value: "table" },
            { label: <LayoutGrid className="size-4" />, value: "grid" },
          ]}
          value={viewMode}
          onChange={(value) => onViewModeChange(value as "table" | "grid")}
          size="small"
          isIconButton
        />
      </div>
    </div>
  );
}
