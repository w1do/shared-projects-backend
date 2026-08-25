"use client";

import React, { useState } from "react";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Checkbox } from "@/components/ui/inputs/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/overlay/dialog";
import { usePromotionsQuery } from "@/hooks/admin/promotions";

const ITEMS_PER_PAGE = 3;

interface PromotionLinkDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function PromotionLinkDialog({
  isOpen,
  onClose,
  selectedIds,
  onToggle,
}: PromotionLinkDialogProps) {
  const { data: promotions = [] } = usePromotionsQuery();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = promotions.filter(
    (p) =>
      p.code.toLowerCase().includes(search.trim().toLowerCase()) ||
      p.title.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="md" tone="card" radius="3xl">
        <DialogHeader>
          <DialogTitle className="font-openrunde text-heading font-medium">
            Link Promotions
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Select one or more active marketing promotions or coupons.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-4">
          <Input
            placeholder="Search promotions..."
            startIcon={<Search />}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="flex flex-col gap-2 min-h-60">
            {paginated.length > 0 ? (
              paginated.map((promo) => {
                const isSelected = selectedIds.includes(promo.id);
                return (
                  <div
                    key={promo.id}
                    onClick={() => onToggle(promo.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer hover:bg-muted/40 transition-colors ${
                      isSelected ? "border-primary bg-primary/5" : "border-border/40"
                    }`}
                  >
                    <Checkbox checked={isSelected} shape="circle" size="medium" />
                    <div className="flex flex-col pl-2">
                      <span className="text-xs font-mono font-semibold text-primary">
                        {promo.code}
                      </span>
                      <span className="text-caption text-muted-foreground-lighter mt-2">
                        {promo.title} ({promo.status})
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-8 text-xs text-muted-foreground-lighter">
                No promotions found.
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
