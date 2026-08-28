"use client";

import * as React from "react";
import { useStickyHeader } from "@/hooks/use-sticky-header";
import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/inputs/button";
import type { Article } from "@/lib/admin/mocks/magazine";
import { blogFormSchema, type BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { tf } from "@/lib/admin/console-texts";
import { useConsoleText } from "@/lib/admin/use-console-text";
import { useEditArticlePage, useUpdateArticleForm } from "@/hooks/admin/articles";
import { articleToFormValues } from "../add/constants";
import {
  BlogFormHeader,
  BlogFormStickyHeader,
  BlogFormBody,
} from "@/components/pages/blogs/sections/blog-form";
import { PostLifecycleCard } from "./PostLifecycleCard";

interface EditBlogFormProps {
  slug: string;
  initialArticle?: Article | null;
}

export function EditBlogForm({ slug, initialArticle = null }: EditBlogFormProps) {
  const t = useConsoleText();
  const [isSticky, setIsSticky] = React.useState(false);
  const { article, isResolving, notFound } = useEditArticlePage({ slug, initialArticle });
  const { submit, isSubmitting } = useUpdateArticleForm(article?.id ?? "");

  React.useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 120);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const methods = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema) as Resolver<BlogFormValues>,
    defaultValues: article ? articleToFormValues(article) : undefined,
  });

  // Страница клиентская: статья приходит после первого рендера, и один только
  // defaultValues оставил бы форму пустой. Перезаполняем по смене идентичности.
  const articleKey = article?.id ?? "";
  const { reset } = methods;
  React.useEffect(() => {
    if (!article) return;
    reset(articleToFormValues(article));
    // article закрыт ключом идентичности — сброс не должен срабатывать на каждый рефетч.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleKey, reset]);

  const onSubmit = async (data: BlogFormValues) => {
    if (!article) return;
    try {
      await submit(data);
    } catch {
      // Errors are toasted inside the form hook.
    }
  };

  if (isResolving) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/60 bg-background p-16 text-center shadow-subtle-3">
        <p className="font-openrunde text-heading text-foreground">
          {t("console.blogs.loading-article")}
        </p>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-border/60 bg-background p-16 text-center shadow-subtle-3">
        <p className="font-openrunde text-heading text-foreground">
          {t("console.blogs.not-found-title")}
        </p>
        <p className="max-w-sm text-caption text-muted-foreground">
          {tf("console.blogs.not-found-description", { slug })}
        </p>
        <Button component="Link" href="/admin/blogs" variant="contained" shape="circle" size="sm">
          {t("console.blogs.back")}
        </Button>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="relative">
        <BlogFormStickyHeader
          title={article.title}
          submitLabel={t("console.blogs.form.save-changes")}
          submitLabelShort={t("console.common.save")}
          submittingLabel={t("console.blogs.form.saving")}
          isSticky={isSticky}
          isSubmitting={isSubmitting}
          backHref="/admin/blogs"
          backLabel={t("console.blogs.back")}
        />

        <div className="flex flex-col gap-8">
          <BlogFormHeader
            title={t("console.blogs.form.edit-title")}
            submitLabel={t("console.blogs.form.save-changes")}
            submittingLabel={t("console.blogs.form.saving")}
            isSubmitting={isSubmitting}
          />

          <BlogFormBody sidebarExtra={<PostLifecycleCard article={article} />} />
        </div>
      </form>
    </FormProvider>
  );
}
