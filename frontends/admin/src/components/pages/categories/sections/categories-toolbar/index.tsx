"use client";

import { Search, LayoutGrid, List, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { ButtonGroup } from "@/components/ui/inputs/button-group";
import { Select } from "@/components/ui/inputs/select";
import { useConsoleText } from "@/lib/admin/use-console-text";

// Метки статусов подменяются локализованными строками при рендере.
const BASE_STATUS_OPTIONS = [
  { value: "all", label: "all" },
  { value: "Active", label: "active" },
  { value: "Draft", label: "draft" },
  { value: "Archived", label: "archived" },
] as const;

interface CategoriesToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterStatus: string;
  setFilterStatus: (value: string) => void;
  viewMode: "grid" | "table";
  setViewMode: (value: "grid" | "table") => void;
  /** Очистка каталога; отсутствует — действие не показывается. */
  onPurgeClick?: () => void;
  /** Каталог пуст: очищать нечего. */
  purgeDisabled?: boolean;
}

export function CategoriesToolbar({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  viewMode,
  setViewMode,
  onPurgeClick,
  purgeDisabled = false,
}: CategoriesToolbarProps) {
  const t = useConsoleText();
  const viewModeOptions = [
    { value: "grid" as const, label: <LayoutGrid className="size-4" /> },
    { value: "table" as const, label: <List className="size-4" /> },
  ];

  const statusOptions = BASE_STATUS_OPTIONS.map((opt) => ({
    value: opt.value,
    label:
      opt.label === "all"
        ? t("console.categories.filter.all-statuses")
        : opt.label === "active"
          ? t("console.categories.status.active")
          : opt.label === "draft"
            ? t("console.categories.status.draft")
            : t("console.categories.status.archived"),
  }));

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Input
        placeholder={t("console.categories.search-placeholder")}
        startIcon={<Search />}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm w-full"
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          options={statusOptions}
          className="w-36"
          placeholder={t("console.categories.filter.status")}
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

        {/* Опасное действие отделено от обычного удаления: отдельная кнопка тулбара. */}
        {onPurgeClick && (
          <Button
            variant="outlined"
            color="error"
            shape="circle"
            size="sm"
            startIcon={<Trash2 />}
            disabled={purgeDisabled}
            onClick={onPurgeClick}
            data-testid="categories-purge"
          >
            {t("console.categories.purge.action")}
          </Button>
        )}
      </div>
    </div>
  );
}
