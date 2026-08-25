"use client";

import type { ProductVariantOption } from "@/lib/admin/mocks/variants";
import { Input } from "@/components/ui/inputs/input";
import { Plus, X, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/inputs/icon-button";
import { Badge } from "@/components/ui/data-display/badge";

interface DimensionCardProps {
  opt: ProductVariantOption;
  activeInputOptName: string | null;
  newValues: Record<string, string>;
  setNewValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setActiveInputOptName: (name: string | null) => void;
  handleRemoveOption: (name: string) => void;
  handleRemoveValue: (optionName: string, valueToRemove: string) => void;
  handleAddValue: (optionName: string) => void;
}

export function DimensionCard({
  opt,
  activeInputOptName,
  newValues,
  setNewValues,
  setActiveInputOptName,
  handleRemoveOption,
  handleRemoveValue,
  handleAddValue,
}: DimensionCardProps) {
  return (
    <div className="p-4 bg-card rounded-2xl shadow-subtle flex flex-col">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground font-mono uppercase">
          {opt.name}
        </span>
        <IconButton
          type="button"
          variant="ghost"
          colors="error"
          onClick={() => handleRemoveOption(opt.name)}
          title="Delete Dimension"
        >
          <Trash2 size={14} />
        </IconButton>
      </div>

      {/* Values chips list */}
      <div className="flex flex-wrap gap-2 items-center">
        {opt.values.map((val) => (
          <Badge
            key={val}
            variant="outlined"
            color="surface"
            shape="circle"
            size="lg"
            className="pr-0 gap-0"
            endIcon={
              <IconButton
                type="button"
                variant="ghost"
                color="error"
                size="sm"
                onClick={() => handleRemoveValue(opt.name, val)}
              >
                <X />
              </IconButton>
            }
          >
            {val}
          </Badge>
        ))}

        {/* Add value form conditionally rendered */}
        {activeInputOptName === opt.name ? (
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <Input
              autoFocus
              size="sm"
              value={newValues[opt.name] || ""}
              onChange={(e) => setNewValues((prev) => ({ ...prev, [opt.name]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newValues[opt.name]?.trim()) {
                  e.preventDefault();
                  handleAddValue(opt.name);
                  setActiveInputOptName(null);
                } else if (e.key === "Escape") {
                  setActiveInputOptName(null);
                }
              }}
              placeholder="Add value..."
              className="text-caption"
            />
            <IconButton
              type="button"
              variant="ghost"
              size="sm"
              shape="circle"
              onClick={() => setActiveInputOptName(null)}
            >
              <X size={12} />
            </IconButton>
          </div>
        ) : (
          <IconButton
            type="button"
            variant="soft"
            size="sm"
            shape="circle"
            onClick={() => {
              setActiveInputOptName(opt.name);
              setNewValues((prev) => ({ ...prev, [opt.name]: "" }));
            }}
            title="Add value"
            className="ml-2"
          >
            <Plus size={12} />
          </IconButton>
        )}
      </div>
    </div>
  );
}
