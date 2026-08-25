"use client";

import { Search, LayoutGrid, List } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { ButtonGroup } from "@/components/ui/inputs/button-group";
import { cn } from "@/lib/utils";
import { Select } from "@/components/ui/inputs/select";

const STATUS_OPTIONS = [
  { value: "all", label: "All status" },
  { value: "Active", label: "Active" },
  { value: "Draft", label: "Draft" },
  { value: "Archived", label: "Archived" },
];

interface CategoriesToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  viewMode: "grid" | "table";
  setViewMode: (value: "grid" | "table") => void;
}

export function CategoriesToolbar({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  viewMode,
  setViewMode,
}: CategoriesToolbarProps) {
  const viewModeOptions = [
    { value: "grid" as const, label: <LayoutGrid className="size-4" /> },
    { value: "table" as const, label: <List className="size-4" /> },
  ];

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder="Search categories by name or slug..."
        startIcon={<Search />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm w-full"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={STATUS_OPTIONS}
          className="w-36"
          placeholder="Filter status"
        />

        <ButtonGroup
          options={viewModeOptions}
          value={viewMode}
          onChange={setViewMode}
          isIconButton
          variant="soft"
          size="sm"
          shape="circle"
          className="h-10 border border-border/40"
        />
      </div>
    </div>
  );
}
