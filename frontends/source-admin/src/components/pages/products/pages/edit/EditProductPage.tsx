"use client";

import type { Brand, Category, Collection, ProductFull } from "@/lib/admin/mocks/types";
import type { ProductVariantConfig } from "@/lib/admin/mocks/variants";
import { useEditProductPage } from "@/hooks/admin/products";
import { EditProductLoadingState } from "@/components/pages/products/loading";
import { EditProductForm } from "./EditProductForm";
import { EditProductNotFoundState } from "./EditProductNotFoundState";

type EditProductPageProps = {
  productId: string;
  /** SSR seed when available (seed catalog / API). Null for localStorage-only products. */
  initialProduct?: ProductFull | null;
  brands: Brand[];
  categories: Category[];
  collections: Collection[];
  variantGroups: ProductVariantConfig[];
};

/**
 * Client boundary for product edit UI. Data/CRUD resolution lives in
 * `useEditProductPage` under `@/hooks/admin/products`.
 */
export function EditProductPage({
  productId,
  initialProduct = null,
  brands,
  categories,
  collections,
  variantGroups,
}: EditProductPageProps) {
  const { product, isResolving, notFound } = useEditProductPage({
    productId,
    initialProduct,
  });

  if (isResolving) {
    return <EditProductLoadingState />;
  }

  if (notFound || !product) {
    return <EditProductNotFoundState productId={productId} />;
  }

  return (
    <EditProductForm
      product={product}
      brands={brands}
      categories={categories}
      collections={collections}
      variantGroups={variantGroups}
    />
  );
}
