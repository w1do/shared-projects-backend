"use client";

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/inputs/textarea";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export function TextEditor({ index }: { index: number }) {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const content = watch(`contentBlocks.${index}.content`) as { body: string };

  return (
    <Textarea
      value={content?.body || ""}
      onChange={(e) => setValue(`contentBlocks.${index}.content`, { body: e.target.value })}
      placeholder="Enter plain text content..."
      rows={4}
      className="resize-none"
    />
  );
}
