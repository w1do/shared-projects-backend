"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { useCreateArticleMutation, useUpdateArticleMutation } from "./use-article-mutations";

export function useCreateArticleForm() {
  const router = useRouter();
  const createMutation = useCreateArticleMutation();

  const submit = async (values: BlogFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success("Article published successfully");
      router.push("/admin/blogs");
    } catch {
      toast.error("Failed to create article.");
      throw new Error("create-article-failed");
    }
  };

  return { submit, isSubmitting: createMutation.isPending };
}

export function useUpdateArticleForm(articleId: string) {
  const router = useRouter();
  const updateMutation = useUpdateArticleMutation(articleId);

  const submit = async (values: BlogFormValues) => {
    try {
      await updateMutation.mutateAsync(values);
      toast.success("Article updated successfully");
      router.push("/admin/blogs");
    } catch {
      toast.error("Failed to update article.");
      throw new Error("update-article-failed");
    }
  };

  return { submit, isSubmitting: updateMutation.isPending };
}
