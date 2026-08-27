"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { t } from "@/lib/admin/console-texts";
import { useCreateArticleMutation, useUpdateArticleMutation } from "./use-article-mutations";

export function useCreateArticleForm() {
  const router = useRouter();
  const createMutation = useCreateArticleMutation();

  const submit = async (values: BlogFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success(t("console.blogs.toast.created"));
      router.push("/admin/blogs");
    } catch {
      toast.error(t("console.blogs.toast.create-failed"));
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
      toast.success(t("console.blogs.toast.updated"));
      router.push("/admin/blogs");
    } catch {
      toast.error(t("console.blogs.toast.update-failed"));
      throw new Error("update-article-failed");
    }
  };

  return { submit, isSubmitting: updateMutation.isPending };
}
