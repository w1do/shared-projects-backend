"use client";

import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Link, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Label } from "@/components/ui/inputs/label";
import { Avatar } from "@/components/ui/data-display/avatar";
import { useCollectionsQuery } from "@/hooks/admin/collections";
import type { CampaignFormValues } from "@/lib/admin/schemas/content/campaign-form-schema";
import { CollectionLinkDialog } from "./CollectionLinkDialog";

export function CollectionSelector() {
  const { data: collections = [] } = useCollectionsQuery();
  const { control } = useFormContext<CampaignFormValues>();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Controller
      control={control}
      name="collectionIds"
      render={({ field, fieldState: { error } }) => {
        const selectedIds = field.value || [];
        const toggleCollection = (id: string) => {
          const isSel = selectedIds.includes(id);
          field.onChange(isSel ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
        };

        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs font-semibold text-muted-foreground">
                Target Collections (Choose at least one)
              </Label>
              <Button
                type="button"
                variant="soft"
                shape="circle"
                size="sm"
                startIcon={<Link />}
                onClick={() => setIsOpen(true)}
              >
                Select Collections
              </Button>
            </div>

            {selectedIds.length > 0 ? (
              <div className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-muted/20 p-2">
                {selectedIds.map((colId) => {
                  const colObj = collections.find((x) => x.id === colId);
                  return (
                    <div
                      key={colId}
                      className="flex items-center justify-between p-4 bg-card border border-border/40 rounded-xl"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar src={colObj?.thumbnail} alt="" shape="rounded" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{colObj?.name ?? colId}</span>
                          <span className="text-caption text-muted-foreground-lighter">
                            {colObj?.productCount ?? 0} products listed
                          </span>
                        </div>
                      </div>
                      <IconButton
                        type="button"
                        variant="ghost"
                        color="error"
                        shape="circle"
                        size="sm"
                        onClick={() => toggleCollection(colId)}
                      >
                        <Trash2 />
                      </IconButton>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-border/60 bg-muted/10 rounded-2xl text-xs text-muted-foreground-lighter">
                No collections linked yet. Click 'Select Collections' to link them.
              </div>
            )}

            {error && (
              <p className="ui-form-help-text font-medium text-destructive">{error.message}</p>
            )}

            <CollectionLinkDialog
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
              selectedIds={selectedIds}
              onToggle={toggleCollection}
            />
          </div>
        );
      }}
    />
  );
}
