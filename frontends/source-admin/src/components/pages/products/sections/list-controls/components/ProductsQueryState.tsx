"use client";

import { AlertCircle, Loader2, PackageOpen, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/feedback/alert";

type ProductsErrorBannerProps = {
  onRetry: () => void;
  isRetrying?: boolean;
};

export function ProductsErrorBanner({ onRetry, isRetrying = false }: ProductsErrorBannerProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>Could not refresh catalog</AlertTitle>
      <AlertDescription>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>The product list failed to load. Cached results may still be shown when available.</p>
          <Button
            variant="outlined"
            color="error"
            size="sm"
            shape="circle"
            startIcon={isRetrying ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            disabled={isRetrying}
            onClick={onRetry}
          >
            {isRetrying ? "Retrying..." : "Try again"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export function ProductsRefetchHint() {
  return (
    <div className="flex items-center gap-2 self-start rounded-full bg-muted px-4 py-2 text-xs text-muted-foreground">
      <PackageOpen className="size-4" />
      <span>Refreshing product catalog…</span>
      <Loader2 className="size-4 animate-spin text-ring" />
    </div>
  );
}
