"use client";

import * as React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/data-display/card";
import { Button } from "@/components/ui/inputs/button";
import {
  ProductFormValues,
  displayTypeOptions,
} from "@/lib/admin/schemas/catalog/product-form-schema";
import { ContentBlockCard } from "./components/ContentBlockCard";
import { ContentBlocksEmptyState } from "./components/ContentBlocksEmptyState";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function getDefaultContent(displayType: string) {
  switch (displayType) {
    case "text":
      return { body: "" };
    case "rich_text":
      return { html: "" };
    case "list":
      return { items: [""] };
    case "table":
      return { headers: ["Column 1", "Column 2"], rows: [["", ""]] };
    case "faq_accordion":
      return { items: [{ question: "", answer: "" }] };
    case "cards":
      return { items: [{ title: "", description: "", image_url: "" }] };
    case "key_value":
      return { items: [{ key: "", value: "" }] };
    default:
      return { body: "" };
  }
}

export function ContentBlocksSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "contentBlocks",
  });

  const handleAddBlock = () => {
    const position = fields.length;
    append({
      id: crypto.randomUUID(),
      title: "",
      slug: "",
      displayType: "text",
      content: getDefaultContent("text"),
      isVisible: true,
      position,
    });
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) move(index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index < fields.length - 1) move(index, index + 1);
  };

  const handleDuplicate = (index: number) => {
    const block = fields[index];
    append({
      ...block,
      id: crypto.randomUUID(),
      title: `${block.title} (copy)`,
      slug: `${block.slug}-copy`,
      position: fields.length,
    });
  };

  return (
    <Card variant="form-section">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-heading font-medium text-foreground leading-tight">Content Blocks</h2>
          <p className="text-xs text-muted-foreground-lighter">
            Add dynamic content sections like ingredients, how-to-use, FAQ, and more
          </p>
        </div>
        <Button
          type="button"
          variant="outlined"
          colors="primary"
          shape="circle"
          size="sm"
          onClick={handleAddBlock}
          startIcon={<Plus />}
        >
          Add Block
        </Button>
      </div>

      {fields.length === 0 ? (
        <ContentBlocksEmptyState onAddBlock={handleAddBlock} />
      ) : (
        <div className="flex flex-col gap-4">
          {fields.map((field, index) => (
            <ContentBlockCard
              key={field.id}
              index={index}
              totalCount={fields.length}
              displayTypeOptions={displayTypeOptions}
              generateSlug={generateSlug}
              getDefaultContent={getDefaultContent}
              onRemove={() => remove(index)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              onDuplicate={() => handleDuplicate(index)}
              onMove={move}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
