"use client";

import * as React from "react";
import { useStickyHeader } from "@/hooks/use-sticky-header";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { blogFormSchema, type BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { blogFormDefaults } from "./constants";
import { blogSampleData } from "./AutofillData";
import {
  BlogFormHeader,
  BlogFormStickyHeader,
  BlogFormBody,
} from "@/components/pages/blogs/sections/blog-form";
import { getArticlesCapabilities } from "@/lib/admin/services";
import { useCreateArticleForm } from "@/hooks/admin/articles";

export function AddBlogForm() {
  const isSticky = useStickyHeader();
  const { submit, isSubmitting } = useCreateArticleForm();

  const methods = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema) as Resolver<BlogFormValues>,
    defaultValues: blogFormDefaults,
  });

  const onSubmit = async (data: BlogFormValues) => {
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  const handleAutoFill = () => {
    if (!getArticlesCapabilities().autoFill) {
      toast.info("Auto-fill is only available in mock template mode.");
      return;
    }
    methods.reset(blogSampleData);
    toast.success("Auto-filled with a sample editorial article");
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <BlogFormStickyHeader
          title="New article"
          submitLabel="Save article"
          submitLabelShort="Save"
          submittingLabel="Publishing…"
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          onAutoFill={handleAutoFill}
          backHref="/admin/blogs"
          backLabel="Back to blogs"
        />

        <div className="flex flex-col gap-8">
          <BlogFormHeader
            title="New article"
            submitLabel="Save article"
            submittingLabel="Publishing…"
            isSubmitting={isSubmitting}
            onAutoFill={handleAutoFill}
          />

          <BlogFormBody />
        </div>
      </form>
    </FormProvider>
  );
}
