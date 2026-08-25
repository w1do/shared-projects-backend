"use client";

import type { InventoryItem } from "@/lib/admin/mocks/types";
import { useInventoryPage } from "@/hooks/admin/inventory";

import { InventoryHeader } from "./sections/inventory-header";
import { InventoryStats } from "./sections/inventory-stats";
import { InventoryPanel } from "./sections/inventory-panel";
import { InventoryFormSheet } from "./sections/inventory-form-sheet";
import { InventoryLoadingState } from "./loading";

interface InventoryPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  initialItems?: InventoryItem[];
}

/**
 * Inventory page — list/adjust/update via useInventoryPage (TanStack Query).
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function InventoryPage({ initialItems }: InventoryPageProps = {}) {
  const {
    items,
    isPending,
    selectedItem,
    isSheetOpen,
    setIsSheetOpen,
    openEdit,
    quickAdjust,
    submitEdit,
  } = useInventoryPage(initialItems !== undefined ? { initialItems } : {});

  if (isPending) {
    return <InventoryLoadingState />;
  }

  return (
    <div className="flex flex-col gap-8">
      <InventoryHeader />
      <InventoryStats items={items} />
      <InventoryPanel items={items} onEditClick={openEdit} onQuickAdjust={quickAdjust} />
      <InventoryFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        item={selectedItem}
        onSubmit={submitEdit}
      />
    </div>
  );
}
