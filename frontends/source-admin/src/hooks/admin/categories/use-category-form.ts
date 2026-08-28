"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CategoryFormValues } from "@/lib/admin/schemas/catalog/category-form-schema";
import { useCreateCategoryMutation, useUpdateCategoryMutation } from "./use-category-mutations";
import { t } from "@/lib/admin/console-texts";

export function useCreateCategoryForm() {
  const router = useRouter();
  const createMutation = useCreateCategoryMutation();

  const submit = async (values: CategoryFormValues) => {
    try {
      const category = await createMutation.mutateAsync(values);
      toast.success(t("console.categories.toast.created").replace("{name}", category.name));
      router.push("/admin/categories");
    } catch {
      toast.error(t("console.categories.toast.create-failed"));
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
        toast.error(t("console.categories.toast.not-found"));
        return;
      }
      toast.success(t("console.categories.toast.updated").replace("{name}", category.name));
      router.push("/admin/categories");
    } catch {
      toast.error(t("console.categories.toast.update-failed"));
      throw new Error("update-category-failed");
    }
  };

  return { submit, isSubmitting: updateMutation.isPending };
}
