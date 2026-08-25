"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { ProductFormValues } from "@/lib/admin/schemas/catalog/product-form-schema";
import { cn } from "@/lib/utils";
import { ContentBlockCardHeader } from "./ContentBlockCardHeader";
import { ContentBlockCardFields } from "./ContentBlockCardFields";

interface ContentBlockCardProps {
  index: number;
  totalCount: number;
  displayTypeOptions: readonly { value: string; label: string }[];
  generateSlug: (title: string) => string;
  getDefaultContent: (displayType: string) => unknown;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
}

export function ContentBlockCard({
  index,
  totalCount,
  displayTypeOptions,
  generateSlug,
  getDefaultContent,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onMove,
}: ContentBlockCardProps) {
  const { register, watch, setValue } = useFormContext<ProductFormValues>();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [draggable, setDraggable] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const dragCounter = React.useRef(0);

  const prefix = `contentBlocks.${index}` as const;
  const title = watch(`contentBlocks.${index}.title`);
  const displayType = watch(`contentBlocks.${index}.displayType`);
  const isVisible = watch(`contentBlocks.${index}.isVisible`);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setValue(`contentBlocks.${index}.title`, newTitle);
    setValue(`contentBlocks.${index}.slug`, generateSlug(newTitle));
  };

  const handleDisplayTypeChange = (newType: string) => {
    setValue(
      `contentBlocks.${index}.displayType`,
      newType as ProductFormValues["contentBlocks"][number]["displayType"],
    );
    setValue(`contentBlocks.${index}.content`, getDefaultContent(newType));
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("text/plain", index.toString());
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
      if (!isNaN(fromIndex) && fromIndex !== index) {
        onMove(fromIndex, index);
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
        "border border-border/40 rounded-2xl bg-muted/30 overflow-hidden transition-all duration-300",
        isDragOver && "border-primary bg-primary/5 border-dashed",
      )}
    >
      {/* Block header */}
      <ContentBlockCardHeader
        index={index}
        totalCount={totalCount}
        title={title}
        isVisible={isVisible}
        isCollapsed={isCollapsed}
        setDraggable={setDraggable}
        setIsCollapsed={setIsCollapsed}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        onToggleVisibility={() => setValue(`contentBlocks.${index}.isVisible`, !isVisible)}
      />

      {/* Block content */}
      {!isCollapsed && (
        <ContentBlockCardFields
          index={index}
          title={title}
          displayType={displayType}
          handleTitleChange={handleTitleChange}
          handleDisplayTypeChange={handleDisplayTypeChange}
          displayTypeOptions={displayTypeOptions}
        />
      )}
    </div>
  );
}
