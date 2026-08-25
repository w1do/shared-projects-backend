"use client";

import { ProductsHeader } from "./sections/ProductsHeader";
import { ProductsStats } from "./sections/ProductsStats";
import { ProductsPanel } from "./sections/ProductsPanel";
import { ProductsLoadingState } from "./loading";
import type { ProductFull } from "@/lib/admin/mock";
import { useProductsPage } from "@/hooks/admin/products";

interface ProductsPageProps {
  /** Optional seed for tests; omit in production so skeleton can show. */
  products?: ProductFull[];
}

/**
 * Products list UI shell. Catalog data/CRUD lives in `@/hooks/admin/products`.
 * Full-page skeleton mirrors layout while the list query is pending.
 */
export default function ProductsPage({ products: initialProducts }: ProductsPageProps = {}) {
  const { products, isPending, isLoading, isError, isFetching, retry } = useProductsPage(
    initialProducts !== undefined ? { initialProducts } : {},
  );

  if (isPending) {
    return <ProductsLoadingState />;
  }

  return (
    <div className="flex flex-col gap-8">
      <ProductsHeader products={products} />
      <ProductsStats products={products} />
      <ProductsPanel
        products={products}
        isLoading={isLoading}
        isError={isError}
        isFetching={isFetching}
        onRetry={retry}
      />
    </div>
  );
}
