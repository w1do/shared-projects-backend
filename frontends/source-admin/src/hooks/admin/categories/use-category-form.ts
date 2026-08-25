"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "./use-category-mutations";

export function useCreateCategoryForm() {
  const router = useRouter();
  const createMutation = useCreateCategoryMutation();

  const submit = async (values: CategoryFormValues) => {
    try {
      const category = await createMutation.mutateAsync(values);
      toast.success(`${category.name} category created successfully`);
      router.push("/admin/categories");
    } catch {
      toast.error("Failed to create category.");
      throw new Error("create-category-failed");
    }
  };

  return { submit, isSubmitting: createMutation.isPending };
}

export function useUpdateCategoryForm(categoryId: string) {
  const router = useRouter();
  const updateMutation = useUpdateCategoryMutation(categoryId);

  const submit = async (values: CategoryFormValues) => {
    try {
      const category = await updateMutation.mutateAsync(values);
      if (!category) {
        toast.error("Category not found.");
        return;
      }
      toast.success(`${category.name} updated successfully`);
      router.push("/admin/categories");
    } catch {
      toast.error("Failed to update category.");
      throw new Error("update-category-failed");
    }
  };

  return { submit, isSubmitting: updateMutation.isPending };
}
