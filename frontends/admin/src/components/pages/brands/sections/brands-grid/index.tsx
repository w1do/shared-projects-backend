"use client";

import type { Brand } from "@/lib/admin/mocks/types";
import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import { BrandCard } from "./components/BrandCard";
import { useProductsQuery } from "@/hooks/admin/products";

interface BrandsGridProps {
  brands: Brand[];
  brandDetailsMap: Record<string, Partial<BrandFormValues>>;
  onDeleteClick: (id: string) => void;
  onPreview: (brand: Brand) => void;
}

export function BrandsGrid({ brands, brandDetailsMap, onDeleteClick, onPreview }: BrandsGridProps) {
  const { data: products = [] } = useProductsQuery();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {brands.length === 0 ? (
        <div className="col-span-full text-center text-xs text-muted-foreground-lighter py-12 border border-dashed border-border rounded-xl">
          No cosmetic brands found matching your criteria.
        </div>
      ) : (
        brands.map((brand) => {
          const details = brandDetailsMap[brand.id] || {};
          const productCount = products.filter(
            (p) => p.brand.toLowerCase() === brand.name.toLowerCase(),
          ).length;

          return (
            <BrandCard
              key={brand.id}
              brand={brand}
              details={details}
              productCount={productCount}
              onDeleteClick={onDeleteClick}
              onPreview={onPreview}
            />
          );
        })
      )}
    </div>
  );
}
