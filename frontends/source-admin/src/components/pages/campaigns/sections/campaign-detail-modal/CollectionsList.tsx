"use client";

import React from "react";
import { Avatar } from "@/components/ui/data-display/avatar";
import { useCollectionsQuery } from "@/hooks/admin/collections";

interface CollectionsListProps {
  collectionIds: string[];
}

export function CollectionsList({ collectionIds }: CollectionsListProps) {
  const { data: collections = [] } = useCollectionsQuery();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-caption text-muted-foreground uppercase tracking-wider font-semibold">
        Linked Collections
      </span>
      <div className="flex flex-col gap-2">
        {collectionIds.map((colId) => {
          const collectionObj = collections.find((item) => item.id === colId);
          if (!collectionObj) return null;
          return (
            <div
              key={colId}
              className="flex items-center gap-4 p-4 border border-border/60 rounded-2xl bg-card"
            >
              <Avatar
                src={collectionObj.thumbnail}
                alt={collectionObj.name}
                size="default"
                shape="rounded"
                fallback={collectionObj.name.substring(0, 2).toUpperCase()}
                className="shrink-0 border border-border/50"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate text-foreground">
                  {collectionObj.name}
                </span>
                <span className="mt-2 text-caption text-muted-foreground-lighter">
                  {collectionObj.productCount ?? 0} products listed
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
