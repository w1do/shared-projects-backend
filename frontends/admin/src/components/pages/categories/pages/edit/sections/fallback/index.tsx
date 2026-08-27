"use client";

import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { useConsoleText } from "@/lib/admin/use-console-text";

interface CategoryEditFallbackProps {
  variant: "loading" | "not-found";
  categoryId: string;
}

export function CategoryEditFallback({ variant, categoryId }: CategoryEditFallbackProps) {
  const t = useConsoleText();
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
        <h2 className="text-xl font-medium text-foreground">
          {t("console.categories.not-found.title")}
        </h2>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground-lighter">
          {t("console.categories.not-found.text").replace("{id}", categoryId)}
        </p>
      </div>
      <Button
        component="Link"
        href="/admin/categories"
        variant="outlined"
        shape="circle"
        startIcon={<ArrowLeft />}
      >
        {t("console.categories.back")}
      </Button>
    </div>
  );
}
