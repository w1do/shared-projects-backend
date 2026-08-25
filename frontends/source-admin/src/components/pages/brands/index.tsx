"use client";

import { BrandsHeader } from "./sections/brands-header";
import { BrandsStats } from "./sections/brands-stats";
import { BrandsPanel } from "./sections/brands-panel";
import { BrandDeleteDialog } from "./sections/brands-panel/components/BrandDeleteDialog";
import { BrandsLoadingState } from "./loading";
import type { Brand } from "@/lib/admin/mocks/types";
import { useBrandsPage } from "@/hooks/admin/brands";

interface BrandsPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  initialBrands?: Brand[];
}

/**
 * Brands portfolio page — data and delete confirmation live in useBrandsPage.
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function BrandsPage({ initialBrands }: BrandsPageProps = {}) {
  const {
    brands,
    isPending,
    deleteTarget,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
  } = useBrandsPage(initialBrands !== undefined ? { initialBrands } : {});

  if (isPending) {
    return <BrandsLoadingState />;
  }

  return (
    <div className="flex flex-col gap-8">
      <BrandsHeader brands={brands} />
      <BrandsStats brands={brands} />
      <BrandsPanel brands={brands} onDeleteClick={requestDelete} />

      <BrandDeleteDialog
        open={!!deleteTarget}
        brandName={deleteTarget?.name}
        isBusy={isDeleting}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
