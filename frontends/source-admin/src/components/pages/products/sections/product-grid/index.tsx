"use client";

import type { ProductFull } from "@/lib/admin/mock";
import { AdminProductCard } from "./components/AdminProductCard";

interface ProductsGridProps {
  products: ProductFull[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onPreview?: (product: ProductFull) => void;
  onArchive?: (product: ProductFull) => void;
  onDelete?: (product: ProductFull) => void;
  userRole?: string;
}

export function ProductsGrid({
  products,
  selectedIds,
  onToggle,
  onPreview,
  onArchive,
  onDelete,
  userRole,
}: ProductsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
      {products.map((product, index) => (
        <AdminProductCard
          key={product.id}
          product={product}
          selected={selectedIds.has(product.id)}
          onToggle={onToggle}
          onPreview={onPreview}
          onArchive={onArchive}
          onDelete={onDelete}
          userRole={userRole}
          priority={index < 4}
        />
      ))}
    </div>
  );
}
