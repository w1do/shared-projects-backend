"use client";

import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";

interface CategoryEditFallbackProps {
  variant: "loading" | "not-found";
  categoryId: string;
}

export function CategoryEditFallback({ variant, categoryId }: CategoryEditFallbackProps) {
  if (variant === "loading") {
    return (
      <div className="flex flex-col gap-8">
        <div className="h-32 animate-pulse rounded-3xl border border-border/40 bg-card shadow-subtle" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="h-80 animate-pulse rounded-3xl border border-border/40 bg-card shadow-subtle lg:col-span-2" />
          <div className="h-64 animate-pulse rounded-3xl border border-border/40 bg-card shadow-subtle" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 rounded-3xl border border-border/40 bg-card p-6 py-24 text-center shadow-subtle">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle size={32} />
      </div>
      <div>
        <h2 className="text-xl font-medium text-foreground">Category Not Found</h2>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground-lighter">
          We couldn&apos;t find a cosmetic category with the ID &quot;{categoryId}&quot;. It may
          have been deleted or never existed.
        </p>
      </div>
      <Button
        component="Link"
        href="/admin/categories"
        variant="outlined"
        shape="circle"
        startIcon={<ArrowLeft />}
      >
        Back to categories
      </Button>
    </div>
  );
}
