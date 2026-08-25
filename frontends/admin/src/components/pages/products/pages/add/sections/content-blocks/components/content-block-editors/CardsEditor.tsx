"use client";

import { useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export function CardsEditor({ index }: { index: number }) {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const content = watch(`contentBlocks.${index}.content`) as {
    items: { title: string; description: string; image_url: string }[];
  };
  const items = content?.items || [{ title: "", description: "", image_url: "" }];

  const updateItems = (newItems: { title: string; description: string; image_url: string }[]) => {
    setValue(`contentBlocks.${index}.content`, { items: newItems });
  };

  const handleAdd = () => updateItems([...items, { title: "", description: "", image_url: "" }]);

  const handleRemove = (i: number) => {
    if (items.length <= 1) return;
    updateItems(items.filter((_, idx) => idx !== i));
  };

  const handleChange = (i: number, field: "title" | "description" | "image_url", value: string) => {
    const updated = items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item));
    updateItems(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item, i) => (
          <div
            key={i}
            className="p-4 border border-border/40 rounded-xl bg-card flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Card {i + 1}</span>
              <IconButton
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(i)}
                disabled={items.length <= 1}
              >
                <X size={14} />
              </IconButton>
            </div>
            <Input
              value={item.title}
              onChange={(e) => handleChange(i, "title", e.target.value)}
              placeholder="Card title"
            />
            <Textarea
              value={item.description}
              onChange={(e) => handleChange(i, "description", e.target.value)}
              placeholder="Card description"
              rows={2}
              className="resize-none"
            />
            <Input
              value={item.image_url}
              onChange={(e) => handleChange(i, "image_url", e.target.value)}
              placeholder="Image URL (optional)"
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAdd}
        startIcon={<Plus size={14} />}
        className="self-start text-xs hover:text-foreground"
      >
        <span className="text-muted-foreground-lighter">Add card</span>
      </Button>
    </div>
  );
}
