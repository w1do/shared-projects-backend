"use client";

import { CollectionsHeader } from "@/components/pages/collections/sections/collections-header";
import { CollectionsStats } from "@/components/pages/collections/sections/collections-stats";
import { CollectionsPanel } from "@/components/pages/collections/sections/collections-panel";
import { CollectionsLoadingState } from "@/components/pages/collections/loading";
import type { Collection } from "@/lib/admin/mocks/types";
import { useCollectionsPage } from "@/hooks/admin/collections";

interface CollectionsPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  initialCollections?: Collection[];
}

/**
 * Collections list UI shell. Catalog data/CRUD lives in `@/hooks/admin/collections`.
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function CollectionsPage({ initialCollections }: CollectionsPageProps = {}) {
  const { collections, isPending, openAdd, openEdit, deleteCollectionById, toggleFeatured } =
    useCollectionsPage(initialCollections !== undefined ? { initialCollections } : {});

  if (isPending) {
    return <CollectionsLoadingState />;
  }

  return (
    <div className="flex flex-col gap-8">
      <CollectionsHeader onAddClick={openAdd} />
      <CollectionsStats collections={collections} />
      <CollectionsPanel
        collections={collections}
        onEditClick={openEdit}
        onDeleteClick={deleteCollectionById}
        onToggleFeatured={toggleFeatured}
      />
    </div>
  );
}
