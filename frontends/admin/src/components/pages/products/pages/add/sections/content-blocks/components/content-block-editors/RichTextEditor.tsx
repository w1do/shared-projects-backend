"use client";

import { useFormContext } from "react-hook-form";
import { RichTextEditor as TiptapEditor } from "@/components/ui/inputs/rich-text-editor";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export function RichTextEditor({ index }: { index: number }) {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const content = watch(`contentBlocks.${index}.content`) as { html: string };

  return (
    <TiptapEditor
      content={content?.html || ""}
      onChange={(html) => setValue(`contentBlocks.${index}.content`, { html })}
      placeholder="Enter HTML content..."
    />
  );
}
