import { ProductFormLoadingState } from "./ProductFormLoadingState";

/**
 * Full-page skeleton for /admin/products/[id]/edit while product detail resolves
 * (client localStorage rehydrate or API latency).
 */
export function EditProductLoadingState() {
  return <ProductFormLoadingState showAutoFill={false} />;
}
