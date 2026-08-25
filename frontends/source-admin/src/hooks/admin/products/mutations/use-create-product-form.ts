"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import { useCreateProductMutation } from "./use-product-mutations";

/**
 * Create-product submit flow (mutation + toast + navigate).
 * Forms only call `submit` — no direct mutation wiring in components/pages.
 */
export function useCreateProductForm() {
  const router = useRouter();
  const createProductMutation = useCreateProductMutation();

  const submit = async (data: ProductFormValues) => {
    try {
      await createProductMutation.mutateAsync(data);
      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to create product");
    }
  };

  return {
    submit,
    isSubmitting: createProductMutation.isPending,
  };
}
