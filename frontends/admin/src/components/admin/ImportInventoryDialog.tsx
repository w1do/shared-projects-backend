"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, X, Loader2, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/overlay/dialog";
import { Button } from "@/components/ui/inputs/button";
import { Alert, AlertDescription } from "@/components/ui/feedback/alert";
import { downloadSampleTemplate } from "@/lib/admin/inventory-import-helpers";
import { useImportInventory } from "@/hooks/use-import-inventory";
import { ImportUploadZone } from "./ImportUploadZone";
import { ImportPreviewTable } from "./ImportPreviewTable";

interface ImportInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportInventoryDialog({ open, onOpenChange }: ImportInventoryDialogProps) {
  const {
    isLoading,
    parsedItems,
    selectedIds,
    errorMsg,
    setParsedItems,
    handleDrop,
    handleToggleSelectAll,
    handleToggleItem,
    handleRemoveItem,
    handleAddProducts,
  } = useImportInventory(open, onOpenChange);

  const totalValid = parsedItems.filter((i) => i.isValid).length;
  const totalInvalid = parsedItems.length - totalValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="wide" radius="3xl">
        <DialogHeader>
          <div className="flex items-center justify-between gap-4 pr-8">
            <DialogTitle className="font-openrunde font-medium">Import Inventory</DialogTitle>
            <Button
              variant="text"
              color="secondary"
              size="sm"
              onClick={downloadSampleTemplate}
              startIcon={<Download className="size-4" />}
            >
              Download Excel Template
            </Button>
          </div>
          <DialogDescription>
            Upload one or more Excel or CSV files to batch add products and configure their initial
            inventory counts.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {parsedItems.length === 0 ? (
          <ImportUploadZone onDrop={handleDrop} isLoading={isLoading} />
        ) : (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-muted p-4 text-caption">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">
                  Total parsed: <strong className="text-foreground">{parsedItems.length}</strong>
                </span>
                <span className="flex items-center gap-2 text-success">
                  <CheckCircle2 className="size-4" />
                  {totalValid} valid
                </span>
                {totalInvalid > 0 && (
                  <span className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="size-4" />
                    {totalInvalid} invalid
                  </span>
                )}
              </div>
              <Button
                variant="text"
                color="error"
                size="sm"
                onClick={() => setParsedItems([])}
                startIcon={<X className="size-4" />}
              >
                Clear all
              </Button>
            </div>

            <ImportPreviewTable
              parsedItems={parsedItems}
              selectedIds={selectedIds}
              onToggleSelectAll={handleToggleSelectAll}
              onToggleItem={handleToggleItem}
              onRemoveItem={handleRemoveItem}
            />
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <DialogFooter>
            <Button variant="outlined" onClick={() => onOpenChange(false)} shape="circle" size="md">
              Cancel
            </Button>
            {parsedItems.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddProducts}
                disabled={isLoading || selectedIds.length === 0}
                shape="circle"
                size="md"
                startIcon={isLoading ? <Loader2 className="size-4 animate-spin" /> : undefined}
              >
                {isLoading ? "Importing..." : `Add ${selectedIds.length} items`}
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
