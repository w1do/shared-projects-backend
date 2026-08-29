"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Input } from "@/components/ui/inputs/input";
import { MarkdownEditor } from "@/components/ui/inputs/markdown-editor";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { useConsoleText } from "@/lib/admin/use-console-text";

/**
 * Содержимое поста блоками: у каждого название и текст в markdown.
 *
 * Идентификатор блока в форме не показывается и не правится — он приходит от
 * платформы и уходит обратно как есть, чтобы ссылка сайта на часть поста
 * пережила правку названия и перестановку блоков.
 */
export function ContentBlocksSection() {
  const t = useConsoleText();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<BlogFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "contentBlocks" });

  return (
    <Card variant="form-section">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-heading font-medium text-foreground leading-tight">
            {t("console.blogs.form.content-title")}
          </h2>
          <p className="text-xs text-muted-foreground-lighter">
            {t("console.blogs.form.content-subtitle")}
          </p>
        </div>
        <Button
          type="button"
          variant="outlined"
          shape="circle"
          size="sm"
          startIcon={<Plus />}
          onClick={() => append({ title: "", markdown: "" })}
          data-testid="content-block-add"
        >
          {t("console.blogs.form.add-block")}
        </Button>
      </div>

      {fields.length === 0 && (
        <p
          className="py-8 text-center text-caption text-muted-foreground-lighter"
          data-testid="content-blocks-empty"
        >
          {t("console.blogs.form.blocks-empty")}
        </p>
      )}

      <div className="flex flex-col gap-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-4 rounded-2xl border border-border/60 p-4"
            data-testid={`content-block-${index}`}
          >
            <div className="flex items-end gap-2">
              <Input
                label={t("console.blogs.form.block-title")}
                className="min-w-0 flex-1"
                error={errors.contentBlocks?.[index]?.title?.message}
                {...register(`contentBlocks.${index}.title`)}
                data-testid="content-block-title"
              />
              <IconButton
                type="button"
                variant="ghost"
                color="error"
                shape="circle"
                size="sm"
                aria-label={t("console.blogs.form.remove-block")}
                onClick={() => remove(index)}
                data-testid="content-block-remove"
              >
                <Trash2 />
              </IconButton>
            </div>

            <Controller
              control={control}
              name={`contentBlocks.${index}.markdown`}
              render={({ field: markdown }) => (
                <MarkdownEditor
                  value={markdown.value ?? ""}
                  onChange={markdown.onChange}
                  label={t("console.blogs.form.block-text")}
                  placeholder={t("console.blogs.form.block-text-placeholder")}
                  error={errors.contentBlocks?.[index]?.markdown?.message}
                  data-testid="content-block-markdown"
                />
              )}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}
