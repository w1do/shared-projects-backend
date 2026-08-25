"use client";

import { formatCurrency } from "@/lib/utils";
import { useWatch } from "react-hook-form";
import Image from "next/image";
import { Folder, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import { iconMap } from "@/components/pages/categories/config/icons";
import { CategoryStatusBadge } from "@/components/pages/categories/sections/category-status-badge";

export function CategoryLivePreview() {
  const values = useWatch<CategoryFormValues>() as CategoryFormValues;

  const name = values.name?.trim() || "Category name";
  const slug = values.slug?.trim() || "category-slug";
  const status = values.status ?? "Active";
  const Icon = (values.iconName && iconMap[values.iconName]) || Folder;
  const gradientId = "category-live-preview";

  return (
    <Card variant="form-section">
      <div>
        <h2 className="text-heading font-medium leading-tight text-foreground">Live Preview</h2>
        <p className="text-xs text-muted-foreground-lighter">
          A real-time look at the storefront category card.
        </p>
      </div>

      <AdminDynamicStyles
        gradients={[
          { id: gradientId, start: values.coverGradientStart, end: values.coverGradientEnd },
        ]}
      />

      <div className="relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card shadow-subtle-3">
        <div
          className="admin-gradient-swatch relative h-16 w-full overflow-hidden"
          data-admin-gradient={gradientId}
        >
          {values.thumbnail && (
            <Image
              src={values.thumbnail}
              alt={name}
              fill
              sizes="(max-width: 1024px) 100vw, 33vw"
              className="object-cover"
            />
          )}
          <div className="absolute right-4 top-4">
            <CategoryStatusBadge status={status} />
          </div>
        </div>

        <div className="absolute left-6 top-8 flex size-14 items-center justify-center rounded-full border border-border/40 bg-card shadow-md">
          <Icon className="size-8 text-foreground" />
        </div>

        <div className="flex flex-col p-6 pt-12">
          <h3 className="truncate font-openrunde text-heading text-foreground" title={name}>
            {name}
          </h3>
          <p className="mt-2 truncate font-mono text-caption text-muted-foreground-lighter">
            /{slug}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
            <div className="flex flex-col">
              <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground-lighter">
                Display Order
              </span>
              <span className="mt-2 text-sm font-semibold text-foreground">
                #{values.displayOrder || 1}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-caption font-semibold uppercase tracking-wider text-muted-foreground-lighter">
                Revenue
              </span>
              <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                {formatCurrency(values.revenue)}
                {Number(values.growthYoY) !== 0 && (
                  <span className="flex items-center font-medium text-caption text-success">
                    <TrendingUp className="mr-1 size-4" />
                    {values.growthYoY}%
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
