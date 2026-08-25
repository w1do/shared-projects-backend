import { ProductFormBodySkeleton } from "./ProductFormBodySkeleton";
import { ProductFormHeaderSkeleton } from "./ProductFormHeaderSkeleton";

type ProductFormLoadingStateProps = {
  /** Show Auto-fill pill skeleton (Add product only). */
  showAutoFill?: boolean;
};

/**
 * Full-page skeleton for Add/Edit product forms.
 * Mirrors AddProductForm / EditProductForm outer nesting:
 * flex-col gap-8 → header → ProductFormBody grid.
 */
export function ProductFormLoadingState({ showAutoFill = false }: ProductFormLoadingStateProps) {
  return (
    <div className="relative" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-8">
        <ProductFormHeaderSkeleton showAutoFill={showAutoFill} />
        <ProductFormBodySkeleton />
      </div>
    </div>
  );
}
