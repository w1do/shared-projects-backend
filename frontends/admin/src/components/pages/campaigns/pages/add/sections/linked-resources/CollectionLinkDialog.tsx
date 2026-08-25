"use client";

import React, { useState } from "react";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Avatar } from "@/components/ui/data-display/avatar";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { useCollectionsQuery } from "@/hooks/admin/collections";

const ITEMS_PER_PAGE = 3;

interface CollectionLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function CollectionLinkDialog({
  isOpen,
  onClose,
  selectedIds,
  onToggle,
}: CollectionLinkDialogProps) {
  const { data: collections = [] } = useCollectionsQuery();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md" tone="card" radius="3xl">
        <DialogHeader>
          <DialogTitle className="font-openrunde text-heading font-medium">
            Link Collections
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select one or more merchandising collections to link to this campaign.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          <Input
            placeholder="Search collections..."
            startIcon={<Search />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex flex-col gap-2 min-h-60">
            {paginated.length > 0 ? (
              paginated.map((col) => {
                const isSelected = selectedIds.includes(col.id);
                return (
                  <div
                    key={col.id}
                    onClick={() => onToggle(col.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer hover:bg-muted/40 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "border-border/40"
                    }`}
                  >
                    <Checkbox checked={isSelected} shape="circle" size="medium" />
                    <Avatar src={col.thumbnail} alt="" shape="rounded" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">{col.name}</span>
                      <span className="text-caption text-muted-foreground-lighter">
                        {col.productCount} products
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 text-xs text-muted-foreground-lighter">
                No collections found.
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2 border-t border-border/40">
            <span className="text-caption text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <IconButton
                type="button"
                variant="outlined"
                shape="circle"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ArrowLeft />
              </IconButton>
              <IconButton
                type="button"
                variant="outlined"
                shape="circle"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ArrowRight />
              </IconButton>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="contained" shape="circle" onClick={onClose}>
              Apply Selection ({selectedIds.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
