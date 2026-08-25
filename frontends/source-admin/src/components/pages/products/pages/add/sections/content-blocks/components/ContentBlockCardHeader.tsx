"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, Copy, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/inputs/button";
import { IconButton } from "@/components/ui/inputs/icon-button";

interface ContentBlockCardHeaderProps {
  index: number;
  totalCount: number;
  title: string;
  isVisible: boolean;
  isCollapsed: boolean;
  setDraggable: (draggable: boolean) => void;
  setIsCollapsed: (collapsed: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onToggleVisibility: () => void;
}

export function ContentBlockCardHeader({
  index,
  totalCount,
  title,
  isVisible,
  isCollapsed,
  setDraggable,
  setIsCollapsed,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onRemove,
  onToggleVisibility,
}: ContentBlockCardHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-4 bg-card border-b border-border/40">
      <GripVertical
        size={16}
        className="text-muted-foreground-lighter shrink-0 cursor-grab active:cursor-grabbing hover:text-foreground transition-colors duration-200"
        onMouseDown={() => setDraggable(true)}
        onMouseUp={() => setDraggable(false)}
      />

      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-foreground truncate block">
          {title || "Untitled Block"}
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          title={isVisible ? "Hide block" : "Show block"}
        >
          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        </IconButton>

        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMoveUp}
          disabled={index === 0}
          title="Move up"
        >
          <ChevronUp size={14} />
        </IconButton>

        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={onMoveDown}
          disabled={index === totalCount - 1}
          title="Move down"
        >
          <ChevronDown size={14} />
        </IconButton>

        <IconButton type="button" variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate">
          <Copy size={14} />
        </IconButton>

        <IconButton
          type="button"
          variant="ghost"
          size="sm"
          color="error"
          onClick={onRemove}
          title="Delete block"
        >
          <Trash2 size={14} />
        </IconButton>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </Button>
      </div>
    </div>
  );
}
