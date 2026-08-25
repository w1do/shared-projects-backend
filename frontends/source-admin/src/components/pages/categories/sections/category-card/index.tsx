"use client";

import { formatCurrency } from "@/lib/utils";
import { Edit2, Trash2, TrendingUp } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import Image from "next/image";
import { AdminDynamicStyles } from "@/components/admin/AdminDynamicStyles";
import type { Category } from "@/lib/admin/mocks/types";
import { getCategoryIcon } from "@/components/pages/categories/config/icons";
import { CategoryStatusBadge } from "../category-status-badge";

interface CategoryCardProps {
  category: Category;
  onEditClick: (category: Category) => void;
  onDeleteClick: (id: string) => void;
}

export function CategoryCard({ category, onEditClick, onDeleteClick }: CategoryCardProps) {
  const IconComponent = getCategoryIcon(category.iconName);

  const [colorStart, colorEnd] = category.coverGradient;
  const gradientId = `category-card-${category.id}`;

  return (
    <>
      <AdminDynamicStyles gradients={[{ id: gradientId, start: colorStart, end: colorEnd }]} />
      <div className="group relative flex flex-col overflow-hidden bg-card border border-border/60 rounded-3xl shadow-subtle-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md min-h-20">
        {/* Visual Cover: category thumbnail over a gradient fallback */}
        <div
          className="h-16 w-full relative overflow-hidden transition-all duration-500 group-hover:opacity-95 admin-gradient-swatch"
          data-admin-gradient={gradientId}
        >
          {category.thumbnail && (
            <Image
              src={category.thumbnail}
              alt={category.name}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover"
            />
          )}
          <div className="absolute top-4 right-4 z-10">
            <CategoryStatusBadge status={category.status} />
          </div>
        </div>

        {/* Floating Icon Wrapper */}
        <div className="absolute top-8 left-6 flex size-14 items-center justify-center rounded-full bg-card border border-border/40 shadow-md transition-transform duration-300 group-hover:scale-105">
          <IconComponent className="size-8 text-foreground" />
        </div>

        {/* Card Body */}
        <div className="flex flex-col flex-1 p-6 pt-12">
          <div className="flex items-start justify-between min-w-0">
            <div className="min-w-0">
              <h3
                className="font-openrunde text-heading text-foreground truncate hover:text-clip"
                title={category.name}
              >
                {category.name}
              </h3>
              <p className="text-caption text-muted-foreground-lighter mt-2 font-mono">
                /{category.slug}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">
            {category.description || "No description provided for this cosmetic category."}
          </p>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4 mt-4">
            <div className="flex flex-col">
              <span className="text-caption text-muted-foreground-lighter uppercase tracking-wider font-semibold">
                Products
              </span>
              <span className="text-sm font-semibold text-foreground mt-2">
                {category.productCount} {category.productCount === 1 ? "Item" : "Items"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-caption text-muted-foreground-lighter uppercase tracking-wider font-semibold">
                Sales Revenue
              </span>
              <span className="text-sm font-semibold text-foreground mt-2 flex items-center gap-2">
                {formatCurrency(category.revenue)}
                {category.status === "Active" && (
                  <span className="text-caption text-success flex items-center font-medium">
                    <TrendingUp className="size-4 mr-1" />
                    {category.growthYoY}%
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Hover Action Overlay (centered over the whole card) */}
          <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 bg-primary/20 opacity-0 backdrop-blur-xs transition-opacity duration-300 group-hover:opacity-100">
            <IconButton
              type="button"
              shape="circle"
              variant="contained"
              color="surface"
              onClick={() => onEditClick(category)}
              title="Edit category"
            >
              <Edit2 />
            </IconButton>
            <IconButton
              type="button"
              shape="circle"
              variant="contained"
              color="surface"
              onClick={() => onDeleteClick(category.id)}
              title="Delete category"
            >
              <Trash2 />
            </IconButton>
          </div>
        </div>
      </div>
    </>
  );
}
