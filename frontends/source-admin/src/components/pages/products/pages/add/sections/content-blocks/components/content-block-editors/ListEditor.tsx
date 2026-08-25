"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { Plus, X, GripVertical } from "lucide-react";
import { Input } from "@/components/ui/inputs/input";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import { cn } from "@/lib/utils";

interface SortableListItemProps {
  item: string;
  idx: number;
  itemsCount: number;
  onChange: (i: number, val: string) => void;
  onRemove: (i: number) => void;
  onMove: (fromIdx: number, toIdx: number) => void;
}

function SortableListItem({
  item,
  idx,
  itemsCount,
  onChange,
  onRemove,
  onMove,
}: SortableListItemProps) {
  const [draggable, setDraggable] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const dragCounter = React.useRef(0);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", idx.toString());
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.classList.add("opacity-40");
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggable(false);
    e.currentTarget.classList.remove("opacity-40");
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOver(false);
    const fromIndexStr = e.dataTransfer.getData("text/plain");
    if (fromIndexStr) {
      const fromIndex = parseInt(fromIndexStr, 10);
      if (!isNaN(fromIndex) && fromIndex !== idx) {
        onMove(fromIndex, idx);
      }
    }
  };

  return (
    <div
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex items-center gap-2 p-2 rounded-xl transition-all duration-300 border border-transparent",
        isDragOver && "border-primary bg-primary/5 border-dashed",
      )}
    >
      <GripVertical
        size={14}
        className="text-muted-foreground-lighter shrink-0 cursor-grab active:cursor-grabbing hover:text-foreground transition-colors duration-200"
        onMouseDown={() => setDraggable(true)}
        onMouseUp={() => setDraggable(false)}
      />
      <Input
        value={item}
        onChange={(e) => onChange(idx, e.target.value)}
        placeholder={`Item ${idx + 1}`}
        className="flex-1"
      />
      <IconButton
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onRemove(idx)}
        disabled={itemsCount <= 1}
      >
        <X size={14} />
      </IconButton>
    </div>
  );
}

export function ListEditor({ index }: { index: number }) {
  const { watch, setValue } = useFormContext<ProductFormValues>();
  const content = watch(`contentBlocks.${index}.content`) as { items: string[] };
  const items = content?.items || [""];

  const updateItems = (newItems: string[]) => {
    setValue(`contentBlocks.${index}.content`, { items: newItems });
  };

  const handleAdd = () => updateItems([...items, ""]);

  const handleRemove = (i: number) => {
    if (items.length <= 1) return;
    updateItems(items.filter((_, idx) => idx !== i));
  };

  const handleChange = (i: number, value: string) => {
    const updated = [...items];
    updated[i] = value;
    updateItems(updated);
  };

  const handleMove = (fromIdx: number, toIdx: number) => {
    const updated = [...items];
    const [movedItem] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, movedItem);
    updateItems(updated);
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => (
        <SortableListItem
          key={i}
          item={item}
          idx={i}
          itemsCount={items.length}
          onChange={handleChange}
          onRemove={handleRemove}
          onMove={handleMove}
        />
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleAdd}
        startIcon={<Plus size={14} />}
        className="self-start text-xs hover:text-foreground"
      >
        <span className="text-muted-foreground-lighter">Add item</span>
      </Button>
    </div>
  );
}
