"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import { useUpdateProductMutation } from "./use-product-mutations";

/**
 * Update-product submit flow (mutation + toast + navigate).
 * Forms only call `submit` — no direct mutation wiring in components/pages.
 */
export function useUpdateProductForm(productId: string) {
  const router = useRouter();
  const updateProductMutation = useUpdateProductMutation(productId);

  const submit = async (data: ProductFormValues) => {
    try {
      await updateProductMutation.mutateAsync(data);
      toast.success("Product updated successfully");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to update product");
    }
  };

  return {
    submit,
    isSubmitting: updateProductMutation.isPending,
  };
}
