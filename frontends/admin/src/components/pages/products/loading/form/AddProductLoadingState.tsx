import { ProductFormLoadingState } from "./ProductFormLoadingState";

/** Full-page skeleton for /admin/products/add (includes Auto-fill action). */
export function AddProductLoadingState() {
  return <ProductFormLoadingState showAutoFill />;
}
