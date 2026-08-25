"use client";

import { useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Textarea } from "@/components/ui/inputs/textarea";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export function FaqEditor({ index }: { index: number }) {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const content = watch(`contentBlocks.${index}.content`) as {
    items: { question: string; answer: string }[];
  };
  const items = content?.items || [{ question: "", answer: "" }];

  const updateItems = (newItems: { question: string; answer: string }[]) => {
    setValue(`contentBlocks.${index}.content`, { items: newItems });
  };

  const handleAdd = () => updateItems([...items, { question: "", answer: "" }]);

  const handleRemove = (i: number) => {
    if (items.length <= 1) return;
    updateItems(items.filter((_, idx) => idx !== i));
  };

  const handleChange = (i: number, field: "question" | "answer", value: string) => {
    const updated = items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item));
    updateItems(updated);
  };

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="p-4 border border-border/40 rounded-xl bg-card flex flex-col gap-4">
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground shrink-0 pt-2">
              Q{i + 1}
            </span>
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
            value={item.question}
            onChange={(e) => handleChange(i, "question", e.target.value)}
            placeholder="Enter question..."
          />
          <Textarea
            value={item.answer}
            onChange={(e) => handleChange(i, "answer", e.target.value)}
            placeholder="Enter answer..."
            rows={2}
            className="resize-none"
          />
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAdd}
        startIcon={<Plus size={14} />}
        className="self-start text-xs hover:text-foreground"
      >
        <span className="text-muted-foreground-lighter">Add Q&A pair</span>
      </Button>
    </div>
  );
}
