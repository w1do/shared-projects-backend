"use client";

import { useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";

export function KeyValueEditor({ index }: { index: number }) {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const content = watch(`contentBlocks.${index}.content`) as {
    items: { key: string; value: string }[];
  };
  const items = content?.items || [{ key: "", value: "" }];

  const updateItems = (newItems: { key: string; value: string }[]) => {
    setValue(`contentBlocks.${index}.content`, { items: newItems });
  };

  const handleAdd = () => updateItems([...items, { key: "", value: "" }]);

  const handleRemove = (i: number) => {
    if (items.length <= 1) return;
    updateItems(items.filter((_, idx) => idx !== i));
  };

  const handleChange = (i: number, field: "key" | "value", value: string) => {
    const updated = items.map((item, idx) => (idx === i ? { ...item, [field]: value } : item));
    updateItems(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <Input
            value={item.key}
            onChange={(e) => handleChange(i, "key", e.target.value)}
            placeholder="Key (e.g. Origin)"
            className="flex-1"
          />
          <Input
            value={item.value}
            onChange={(e) => handleChange(i, "value", e.target.value)}
            placeholder="Value (e.g. South Korea)"
            className="flex-1"
          />
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
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAdd}
        startIcon={<Plus size={14} />}
        className="self-start text-xs hover:text-foreground"
      >
        <span className="text-muted-foreground-lighter">Add pair</span>
      </Button>
    </div>
  );
}
