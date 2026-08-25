"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { CollectionFormValues } from "@/lib/admin/schemas/catalog/collection-form-schema";
import {
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
} from "./use-collection-mutations";

export function useCreateCollectionForm() {
  const router = useRouter();
  const createMutation = useCreateCollectionMutation();

  const submit = async (values: CollectionFormValues) => {
    try {
      const collection = await createMutation.mutateAsync(values);
      toast.success(`${collection.name} collection created successfully`);
      router.push("/admin/collections");
    } catch {
      toast.error("Failed to create collection.");
      throw new Error("create-collection-failed");
    }
  };

  return { submit, isSubmitting: createMutation.isPending };
}

export function useUpdateCollectionForm(collectionId: string) {
  const router = useRouter();
  const updateMutation = useUpdateCollectionMutation(collectionId);

  const submit = async (values: CollectionFormValues) => {
    try {
      const collection = await updateMutation.mutateAsync(values);
      if (!collection) {
        toast.error("Collection not found.");
        return;
      }
      toast.success(`${collection.name} updated successfully`);
      router.push("/admin/collections");
    } catch {
      toast.error("Failed to update collection.");
      throw new Error("update-collection-failed");
    }
  };

  return { submit, isSubmitting: updateMutation.isPending };
}
