"use client";

import * as React from "react";
import { useStickyHeader } from "@/hooks/use-sticky-header";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { blogFormSchema, type BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { blogFormDefaults } from "./constants";
import {
  BlogFormHeader,
  BlogFormStickyHeader,
  BlogFormBody,
} from "@/components/pages/blogs/sections/blog-form";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { useCreateArticleForm } from "@/hooks/admin/articles";
import { TopicPicker } from "@/components/pages/blogs/sections/TopicPicker";

export function AddBlogForm() {
  const t = useConsoleText();
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <BlogFormStickyHeader
          title={t("console.blogs.new-article")}
          submitLabel={t("console.blogs.form.save")}
          submitLabelShort={t("console.common.save")}
          submittingLabel={t("console.blogs.form.publishing")}
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          backHref="/admin/blogs"
          backLabel={t("console.blogs.back")}
        />

        <div className="flex flex-col gap-8">
          <BlogFormHeader
            title={t("console.blogs.new-article")}
            submitLabel={t("console.blogs.form.save")}
            submittingLabel={t("console.blogs.form.publishing")}
            isSubmitting={isSubmitting}
          />

          <TopicPicker />

          <BlogFormBody />
        </div>
      </form>
    </FormProvider>
  );
}
