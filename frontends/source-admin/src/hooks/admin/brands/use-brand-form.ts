"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BrandFormValues } from "@/lib/admin/schemas/catalog/brand-form-schema";
import { useCreateBrandMutation, useUpdateBrandMutation } from "./use-brand-mutations";

/** Create brand form submit — toast + navigate. */
export function useCreateBrandForm() {
  const router = useRouter();
  const createMutation = useCreateBrandMutation();

  const submit = async (values: BrandFormValues) => {
    try {
      const brand = await createMutation.mutateAsync(values);
      toast.success(`${brand.name} brand created successfully`);
      router.push("/admin/brands");
    } catch {
      toast.error("Failed to create brand. Please check validation rules.");
      throw new Error("create-brand-failed");
    }
  };

  return { submit, isSubmitting: createMutation.isPending };
}

/** Update brand form submit — toast + navigate. */
export function useUpdateBrandForm(brandId: string) {
  const router = useRouter();
  const updateMutation = useUpdateBrandMutation(brandId);

  const submit = async (values: BrandFormValues) => {
    try {
      const brand = await updateMutation.mutateAsync(values);
      if (!brand) {
        toast.error("Brand not found.");
        return;
      }
      toast.success(`${brand.name} updated successfully`);
      router.push("/admin/brands");
    } catch {
      toast.error("Failed to update brand.");
      throw new Error("update-brand-failed");
    }
  };

  return { submit, isSubmitting: updateMutation.isPending };
}
