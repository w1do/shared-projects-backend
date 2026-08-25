"use client";

import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Textarea } from "@/components/ui/inputs/textarea";
import { ImageUploader } from "@/components/ui/inputs/image-uploader";
import { Select } from "@/components/ui/inputs/select";
import type { BlogFormValues } from "@/lib/admin/schemas/content/blog-form-schema";
import { BLOCK_TYPE_OPTIONS } from "@/components/pages/blogs/pages/add/constants";

export function ContentBlocksSection() {
  const {
    control,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<BlogFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "contentBlocks" });

  return (
    <Card variant="form-section">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-heading font-medium text-foreground leading-tight">Content</h2>
          <p className="text-xs text-muted-foreground-lighter">
            Compose the story from headings, paragraphs, quotes, and images.
          </p>
        </div>
        <Button
          type="button"
          variant="outlined"
          shape="circle"
          size="sm"
          startIcon={<Plus />}
          onClick={() => append({ type: "paragraph", content: "" })}
        >
          Add block
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => {
          const blockType = watch(`contentBlocks.${index}.type`);
          const blockValue = watch(`contentBlocks.${index}.content`);
          const blockError = errors.contentBlocks?.[index]?.content?.message;

          return (
            <div
              key={field.id}
              className="flex flex-col gap-4 rounded-2xl border border-border/50 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <Controller
                  name={`contentBlocks.${index}.type`}
                  control={control}
                  render={({ field: typeField }) => (
                    <Select
                      value={typeField.value}
                      onChange={(e) => typeField.onChange(e.target.value)}
                      options={BLOCK_TYPE_OPTIONS}
                      className="w-40"
                    />
                  )}
                />
                <IconButton
                  type="button"
                  size="sm"
                  shape="circle"
                  variant="ghost"
                  colors="error"
                  title="Remove block"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 />
                </IconButton>
              </div>

              {blockType === "image" ? (
                <ImageUploader
                  value={blockValue ? [blockValue] : []}
                  onChange={(images) =>
                    setValue(`contentBlocks.${index}.content`, images[0] || "", {
                      shouldValidate: true,
                    })
                  }
                  maxFiles={1}
                  multiple={false}
                  placeholder="Upload image"
                  description="Inline image displayed within the article body"
                  error={blockError}
                  aspectRatio="video"
                />
              ) : (
                <Textarea
                  rows={3}
                  placeholder="Write the block content…"
                  error={blockError}
                  {...register(`contentBlocks.${index}.content`)}
                />
              )}
            </div>
          );
        })}
      </div>

      {errors.contentBlocks?.root && (
        <p className="ui-form-help-text font-medium text-destructive">
          {errors.contentBlocks.root.message}
        </p>
      )}
    </Card>
  );
}
